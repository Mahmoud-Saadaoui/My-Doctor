import prisma from '../config/db.js';

const timeToDate = value => {
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
};

const serializeAvailability = availability => ({
  ...availability,
  startTime: availability.startTime.toISOString().slice(11, 16),
  endTime: availability.endTime.toISOString().slice(11, 16),
});

/**
 * Check if two time ranges overlap.
 * Returns true if they overlap, false otherwise.
 */
const timesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

export const create = async (req, res, next) => {
  if (req.currentUser.userType !== 'doctor') {
    return res.status(403).json({
      message: req.t('availability.onlyDoctors'),
      messageKey: 'availability.onlyDoctors',
    });
  }

  const { dayOfWeek, startTime, endTime, timezone } = req.body;

  if (startTime >= endTime) {
    return res.status(400).json({
      message: req.t('availability.endBeforeStart'),
      messageKey: 'availability.endBeforeStart',
    });
  }

  try {
    // Check for overlapping availability slots
    const existingSlots = await prisma.availability.findMany({
      where: {
        doctorId: req.currentUser.id,
        dayOfWeek,
        isActive: true,
      },
    });

    const newStart = timeToDate(startTime);
    const newEnd = timeToDate(endTime);

    const hasOverlap = existingSlots.some(slot => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      return timesOverlap(newStart, newEnd, slotStart, slotEnd);
    });

    if (hasOverlap) {
      return res.status(409).json({
        message: req.t('availability.overlap'),
        messageKey: 'availability.overlap',
      });
    }

    const availability = await prisma.availability.create({
      data: {
        doctorId: req.currentUser.id,
        dayOfWeek,
        startTime: newStart,
        endTime: newEnd,
        timezone: timezone || 'Africa/Tunis',
      },
    });

    return res.status(201).json(serializeAvailability(availability));
  } catch (error) {
    return next(error);
  }
};

export const destroy = async (req, res, next) => {
  if (req.currentUser.userType !== 'doctor') {
    return res.status(403).json({
      message: req.t('availability.onlyDoctors'),
      messageKey: 'availability.onlyDoctors',
    });
  }

  try {
    const result = await prisma.availability.deleteMany({
      where: { id: Number(req.params.availabilityId), doctorId: req.currentUser.id },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: req.t('availability.notFound'),
        messageKey: 'availability.notFound',
      });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get available time slots for a doctor within a date range.
 * Returns slots that are within the doctor's availability and not already booked.
 */
export const getAvailableSlots = async (req, res, next) => {
  try {
    const doctorId = Number(req.params.id);
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: req.t('appointments.invalidDates'),
        messageKey: 'appointments.invalidDates',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: req.t('appointments.invalidDates'),
        messageKey: 'appointments.invalidDates',
      });
    }

    // Get doctor's availability
    const doctor = await prisma.user.findFirst({
      where: { id: doctorId, userType: 'doctor' },
      include: {
        profile: true,
        availabilities: {
          where: { isActive: true },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        message: req.t('doctors.notFound'),
        messageKey: 'doctors.notFound',
      });
    }

    // Get existing appointments in the date range
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: { notIn: ['cancelled', 'no_show'] },
        startsAt: { gte: start, lte: end },
      },
    });

    // Generate available slots based on availability
    const availableSlots = [];
    const appointmentDuration = 30; // minutes - configurable

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();

      // Find availability for this day of week
      const dayAvailability = doctor.availabilities.filter(
        slot => slot.dayOfWeek === dayOfWeek
      );

      for (const slot of dayAvailability) {
        const slotStart = new Date(currentDate);
        const [startHours, startMinutes] = slot.startTime.toISOString().slice(11, 16).split(':').map(Number);
        slotStart.setHours(startHours, startMinutes, 0, 0);

        const slotEnd = new Date(currentDate);
        const [endHours, endMinutes] = slot.endTime.toISOString().slice(11, 16).split(':').map(Number);
        slotEnd.setHours(endHours, endMinutes, 0, 0);

        // Generate slots within this availability window
        let slotTime = new Date(slotStart);
        while (slotTime < slotEnd) {
          const slotEndTime = new Date(slotTime.getTime() + appointmentDuration * 60000);

          // Check if slot is in the future
          if (slotTime > new Date()) {
            // Check if slot conflicts with existing appointments
            const hasConflict = existingAppointments.some(apt => {
              const aptStart = new Date(apt.startsAt);
              const aptEnd = new Date(apt.endsAt);
              return slotTime < aptEnd && slotEndTime > aptStart;
            });

            if (!hasConflict) {
              availableSlots.push({
                startsAt: slotTime.toISOString(),
                endsAt: slotEndTime.toISOString(),
              });
            }
          }

          slotTime = slotEndTime;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return res.status(200).json({
      data: availableSlots,
      meta: {
        doctorId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        duration: appointmentDuration,
        timezone: doctor.profile?.timezone || 'Africa/Tunis',
      },
    });
  } catch (error) {
    return next(error);
  }
};
