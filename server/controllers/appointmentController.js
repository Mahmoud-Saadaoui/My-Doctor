const { Op, Transaction } = require('sequelize');
const models = require('../models');
const db = require('../models/database');

const appointmentIncludes = [
  {
    model: models.User,
    as: 'doctor',
    attributes: { exclude: ['password'] },
    include: [{ model: models.Profile, as: 'profile', attributes: ['specialization', 'address', 'phone'] }],
  },
  {
    model: models.User,
    as: 'patient',
    attributes: ['id', 'name', 'email'],
  },
];

const parseAppointmentDates = (startsAt, endsAt) => {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: 'Invalid appointment dates' };
  }

  if (start <= new Date()) {
    return { error: 'Appointment must be scheduled in the future' };
  }

  if (end <= start) {
    return { error: 'Appointment end must be after its start' };
  }

  if (end.getTime() - start.getTime() > 24 * 60 * 60 * 1000) {
    return { error: 'Appointment duration cannot exceed 24 hours' };
  }

  return { start, end };
};

exports.index = async (req, res, next) => {
  try {
    const where = {
      [Op.or]: [
        { patientId: req.currentUser.id },
        { doctorId: req.currentUser.id },
      ],
    };

    if (req.query.status) {
      where.status = req.query.status;
    }

    const appointments = await models.Appointment.findAll({
      where,
      include: appointmentIncludes,
      order: [['startsAt', 'DESC']],
    });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const { doctorId, startsAt, endsAt, reason } = req.body;
  const dates = parseAppointmentDates(startsAt, endsAt);

  if (dates.error) {
    return res.status(400).json({ message: dates.error });
  }

  if (Number(doctorId) === Number(req.currentUser.id)) {
    return res.status(400).json({ message: 'A doctor cannot book an appointment with themselves' });
  }

  let transaction;

  try {
    transaction = await db.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    });
    const doctor = await models.User.findOne({
      where: { id: doctorId, userType: 'doctor' },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!doctor) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const conflict = await models.Appointment.findOne({
      where: {
        doctorId,
        status: { [Op.notIn]: ['cancelled', 'no_show'] },
        startsAt: { [Op.lt]: dates.end },
        endsAt: { [Op.gt]: dates.start },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (conflict) {
      await transaction.rollback();
      return res.status(409).json({ message: 'This time slot is no longer available' });
    }

    const appointment = await models.Appointment.create({
      patientId: req.currentUser.id,
      doctorId,
      startsAt: dates.start,
      endsAt: dates.end,
      reason,
      status: 'pending',
    }, { transaction });

    await transaction.commit();

    const createdAppointment = await models.Appointment.findByPk(appointment.id, {
      include: appointmentIncludes,
    });

    res.status(201).json(createdAppointment);
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const appointment = await models.Appointment.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { patientId: req.currentUser.id },
          { doctorId: req.currentUser.id },
        ],
        status: { [Op.notIn]: ['cancelled', 'completed', 'no_show'] },
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Active appointment not found' });
    }

    await appointment.update({
      status: 'cancelled',
      cancellationReason: req.body.reason || null,
    });

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  const allowedStatuses = ['confirmed', 'completed', 'no_show', 'cancelled'];

  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid appointment status' });
  }

  if (req.currentUser.userType !== 'doctor') {
    return res.status(403).json({ message: 'Only doctors can update appointment status' });
  }

  try {
    const appointment = await models.Appointment.findOne({
      where: { id: req.params.id, doctorId: req.currentUser.id },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await appointment.update({
      status: req.body.status,
      cancellationReason: req.body.status === 'cancelled' ? req.body.reason || null : null,
    });

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};
