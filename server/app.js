import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import routes from './routes/index.js';
import prisma, { checkDbConnection } from './config/db.js';
import { i18nMiddleware } from './config/i18n.js';
import errorHandler from './middlewares/error.middleware.js';
import { AppError } from './errors/app-error.js';

const port = Number(process.env.PORT || 4000);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const app = express();
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

app.disable('x-powered-by');
app.use(i18nMiddleware);
app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: req.t('errors.rateLimitExceeded'),
      messageKey: 'errors.rateLimitExceeded',
      language: req.language,
    });
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Stricter rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: req.t('errors.rateLimitExceeded'),
      messageKey: 'errors.rateLimitExceeded',
      language: req.language,
    });
  },
});

app.use('/api/v1/account/login', authLimiter);
app.use('/api/v1/account/signup', authLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health/db', async (_req, res) => {
  try {
    await checkDbConnection();
    res.status(200).json({ status: 'ok', database: 'ok' });
  } catch (error) {
    console.error('Database health check failed', error);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/api/v1', routes);

app.use((_req, _res, next) => {
  next(new AppError(404, 'errors.routeNotFound'));
});

app.use(errorHandler);

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured before starting the server');
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await checkDbConnection();
      console.log('Database connected successfully through Prisma');
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        console.warn(`Database connection attempt ${attempt} failed; retrying...`);
        await wait(2000);
      }
    }
  }

  if (lastError) {
    console.error('Unable to connect to the database', lastError);
    throw lastError;
  }

  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer().catch(error => {
    console.error('Unable to start the server', error);
    process.exit(1);
  });
}

export { app, prisma, startServer };
