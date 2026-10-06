import jsonwebtoken from 'jsonwebtoken';
import prisma from '../config/db.js';

const isLoggedIn = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (!token || !['Bearer', 'JWT'].includes(scheme)) {
    return res.status(401).json({
      message: req.t('auth.authenticationRequired'),
      messageKey: 'auth.authenticationRequired',
      language: req.language,
    });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.sub || decoded.id) },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: req.t('auth.accountNotFound'),
        messageKey: 'auth.accountNotFound',
        language: req.language,
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: req.t('auth.invalidToken'),
        messageKey: 'auth.invalidToken',
        language: req.language,
      });
    }

    next(error);
  }
};

export default isLoggedIn;
