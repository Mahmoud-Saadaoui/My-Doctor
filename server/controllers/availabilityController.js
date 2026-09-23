const models = require('../models');

exports.create = async (req, res, next) => {
  if (req.currentUser.userType !== 'doctor') {
    return res.status(403).json({ message: 'Only doctors can manage availability' });
  }

  const { dayOfWeek, startTime, endTime, timezone } = req.body;

  if (startTime >= endTime) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  try {
    const availability = await models.Availability.create({
      doctorId: req.currentUser.id,
      dayOfWeek,
      startTime,
      endTime,
      timezone: timezone || 'Africa/Tunis',
    });

    res.status(201).json(availability);
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  if (req.currentUser.userType !== 'doctor') {
    return res.status(403).json({ message: 'Only doctors can manage availability' });
  }

  try {
    const deleted = await models.Availability.destroy({
      where: { id: req.params.availabilityId, doctorId: req.currentUser.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
