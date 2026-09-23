const jsonwebtoken = require('jsonwebtoken');
const models = require('../models');

const isLoggedIn = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (!token || !['Bearer', 'JWT'].includes(scheme)) {
    return res.status(401).json({ message: 'Authentication is required' });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const user = await models.User.findByPk(decoded.sub || decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists' });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired authentication token' });
    }

    next(error);
  }
};

module.exports = isLoggedIn;
