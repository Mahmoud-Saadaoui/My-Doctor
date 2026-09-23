const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const models = require('../models');
const db = require('../models/database');

const publicUserAttributes = { exclude: ['password'] };

const createToken = user => jsonwebtoken.sign(
  { sub: user.id, userType: user.userType },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
);

exports.register = async (req, res, next) => {
  const {
    name,
    email,
    password,
    userType = 'normal',
    location,
    specialization,
    address,
    workingHours,
    phone,
  } = req.body;

  let transaction;

  try {
    transaction = await db.transaction();
    const user = await models.User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      userType,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    }, { transaction });

    if (userType === 'doctor') {
      await models.Profile.create({
        userId: user.id,
        specialization,
        address,
        workingHours,
        phone,
      }, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: user.id, name: user.name, email: user.email, userType: user.userType },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await models.User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      accessToken: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.me = (req, res) => {
  res.json(req.currentUser);
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await models.User.findByPk(req.currentUser.id, {
      include: [{ model: models.Profile, as: 'profile' }],
      attributes: publicUserAttributes,
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  const {
    name,
    password,
    userType,
    specialization,
    address,
    location,
    workingHours,
    phone,
  } = req.body;
  let transaction;

  try {
    transaction = await db.transaction();
    const user = await models.User.findByPk(req.currentUser.id, { transaction, lock: transaction.LOCK.UPDATE });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = { name, userType };
    if (password) updateData.password = await bcrypt.hash(password, 12);
    if (location) {
      updateData.latitude = location.latitude ?? null;
      updateData.longitude = location.longitude ?? null;
    }

    await user.update(updateData, { transaction });

    if (userType === 'doctor') {
      const [profile] = await models.Profile.findOrCreate({
        where: { userId: user.id },
        defaults: { userId: user.id, specialization, address, workingHours, phone },
        transaction,
      });

      await profile.update({ specialization, address, workingHours, phone }, { transaction });
    } else {
      await models.Profile.destroy({ where: { userId: user.id }, transaction });
    }

    await transaction.commit();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const deleted = await models.User.destroy({ where: { id: req.currentUser.id } });

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};
