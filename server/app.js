require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const db = require('./models/database');
const routes = require('./routes');

const port = Number(process.env.PORT || 4000);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1', routes);

app.use((_req, _res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = status >= 500 ? 'Internal server error' : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    message,
    ...(error.errors ? { errors: error.errors } : {}),
  });
});

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured before starting the server');
  }

  try {
    await db.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database', error);
    throw error;
  }

  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
};

if (require.main === module) {
  startServer().catch(error => {
    console.error('Unable to start the server', error);
    process.exit(1);
  });
}

module.exports = { app, startServer };
