const { Op } = require('sequelize');
const models = require('../models');

const doctorInclude = {
  model: models.Profile,
  as: 'profile',
  attributes: { exclude: ['userId'] },
};

const parsePagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 12, 1), 50);

  return { page, limit, offset: (page - 1) * limit };
};

exports.index = async (req, res, next) => {
  try {
    const { q, specialization } = req.query;
    const { page, limit, offset } = parsePagination(req.query);
    const where = { userType: 'doctor' };

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { '$profile.specialization$': { [Op.iLike]: `%${q}%` } },
      ];
    }

    if (specialization) {
      where['$profile.specialization$'] = { [Op.iLike]: `%${specialization}%` };
    }

    const result = await models.User.findAndCountAll({
      where,
      include: [doctorInclude],
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    res.status(200).json({
      data: result.rows,
      meta: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const doctor = await models.User.findOne({
      where: { id: req.params.id, userType: 'doctor' },
      include: [doctorInclude],
      attributes: { exclude: ['password'] },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

exports.availability = async (req, res, next) => {
  try {
    const doctor = await models.User.findOne({
      where: { id: req.params.id, userType: 'doctor' },
      attributes: ['id'],
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const availability = await models.Availability.findAll({
      where: { doctorId: doctor.id, isActive: true },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
      attributes: { exclude: ['doctorId'] },
    });

    res.status(200).json(availability);
  } catch (error) {
    next(error);
  }
};
