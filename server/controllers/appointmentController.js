import { Prisma } from '../prisma/generated/prisma/client.js';
import prisma from '../config/db.js';
import {
  sendAppointmentRequestNotification,
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentRejection,
} from '../services/emailService.js';

const appointmentInclude = {
  doctor: {
    select: {
      id: true,
      name: true,
      email: true,
      userType: true,
      profile: {
        select: {
          specialization: true,
          address: true,
          phone: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  },
  patient: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const parseAppointmentDates = (startsAt, endsAt) => {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { errorKey: 'appointments.invalidDates' };
  }

  if (start <= new Date()) {
    return { errorKey: 'appointments.mustBeFuture' };
  }

  if (end <= start) {
    return { errorKey: 'appointments.endBeforeStart' };
  }

  if (end.getTime() - start.getTime() > 24 * 60 * 60 * 1000) {
    return { errorKey: 'appointments.durationTooLong' };
  }

  return { start, end };
};

export const index = async (req, res, next) => {
  try {
    const where = {
      OR: [
        { patientId: req.currentUser.id },
        { doctorId: req.currentUser.id },
      ],
      ...(req.query.status ? { status: req.query.status } : {}),
    };

    const appointments = await prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { startsAt: 'desc' },
    });

    return res.status(200).json(appointments);
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  const { doctorId: rawDoctorId, startsAt, endsAt, reason } = req.body;
  const doctorId = Number(rawDoctorId);
  const dates = parseAppointmentDates(startsAt, endsAt);

  if (dates.errorKey) {
    return res.status(400).json({
      message: req.t(dates.errorKey),
      messageKey: dates.errorKey,
    });
  }

  if (doctorId === Number(req.currentUser.id)) {
    return res.status(400).json({
      message: req.t('appointments.selfBooking'),
      messageKey: 'appointments.selfBooking',
    });
  }

  try {
    const result = await prisma.$transaction(async tx => {
      const lockedDoctor = await tx.$queryRaw`
        SELECT "id"
        FROM "users"
        WHERE "id" = ${doctorId}
          AND "userType" = 'doctor'::"UserType"
        FOR UPDATE
      `;

      if (lockedDoctor.length === 0) {
        return { type: 'doctor-not-found' };
      }

      const conflict = await tx.appointment.findFirst({
        where: {
          doctorId,
          status: { notIn: ['cancelled', 'no_show'] },
          startsAt: { lt: dates.end },
          endsAt: { gt: dates.start },
        },
      });

      if (conflict) {
        return { type: 'conflict' };
      }

      const appointment = await tx.appointment.create({
        data: {
          patientId: req.currentUser.id,
          doctorId,
          startsAt: dates.start,
          endsAt: dates.end,
          reason,
          status: 'pending',
        },
      });

      return { type: 'created', id: appointment.id };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    if (result.type === 'doctor-not-found') {
      return res.status(404).json({
        message: req.t('appointments.doctorNotFound'),
        messageKey: 'appointments.doctorNotFound',
      });
    }

    if (result.type === 'conflict') {
      return res.status(409).json({
        message: req.t('appointments.slotUnavailable'),
        messageKey: 'appointments.slotUnavailable',
      });
    }

    const createdAppointment = await prisma.appointment.findUnique({
      where: { id: result.id },
      include: appointmentInclude,
    });

    // Send notification emails (non-blocking)
    const doctor = createdAppointment.doctor;
    const patient = createdAppointment.patient;
    sendAppointmentRequestNotification(doctor.email, patient.name, {
      date: createdAppointment.startsAt,
      reason: createdAppointment.reason,
    }).catch(err => console.error('Failed to send appointment request notification:', err));

    return res.status(201).json(createdAppointment);
  } catch (error) {
    if (error.code === 'P2034') {
      return res.status(409).json({
        message: req.t('appointments.slotUnavailable'),
        messageKey: 'appointments.slotUnavailable',
      });
    }

    return next(error);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: Number(req.params.id),
        OR: [
          { patientId: req.currentUser.id },
          { doctorId: req.currentUser.id },
        ],
        status: { notIn: ['cancelled', 'completed', 'no_show'] },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        message: req.t('appointments.activeNotFound'),
        messageKey: 'appointments.activeNotFound',
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'cancelled',
        cancellationReason: req.body.reason || null,
      },
      include: appointmentInclude,
    });

    // Send cancellation notification to the other party
    const cancelledBy = req.currentUser.userType === 'doctor' ? 'the doctor' : 'the patient';
    const recipientEmail = req.currentUser.userType === 'doctor'
      ? updatedAppointment.patient.email
      : updatedAppointment.doctor.email;

    sendAppointmentCancellation(recipientEmail, {
      date: updatedAppointment.startsAt,
      reason: updatedAppointment.cancellationReason,
    }, cancelledBy).catch(err => console.error('Failed to send cancellation notification:', err));

    return res.status(200).json(updatedAppointment);
  } catch (error) {
    return next(error);
  }
};

/**
 * Appointment status transition matrix.
 * Defines which status changes are allowed from each status.
 */
const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  cancelled: [],
  completed: [],
  no_show: [],
};

export const updateStatus = async (req, res, next) => {
  const { status: newStatus } = req.body;

  if (!['pending', 'confirmed', 'cancelled', 'completed', 'no_show'].includes(newStatus)) {
    return res.status(400).json({
      message: req.t('appointments.invalidStatus'),
      messageKey: 'appointments.invalidStatus',
    });
  }

  if (req.currentUser.userType !== 'doctor') {
    return res.status(403).json({
      message: req.t('appointments.onlyDoctorsCanUpdate'),
      messageKey: 'appointments.onlyDoctorsCanUpdate',
    });
  }

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id: Number(req.params.id), doctorId: req.currentUser.id },
    });

    if (!appointment) {
      return res.status(404).json({
        message: req.t('appointments.notFound'),
        messageKey: 'appointments.notFound',
      });
    }

    // Check if the transition is allowed
    const allowedTransitions = STATUS_TRANSITIONS[appointment.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return res.status(400).json({
        message: req.t('appointments.invalidTransition'),
        messageKey: 'appointments.invalidTransition',
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: newStatus,
        cancellationReason: newStatus === 'cancelled' ? req.body.reason || null : null,
      },
      include: appointmentInclude,
    });

    // Send notification emails based on status change
    if (newStatus === 'confirmed') {
      sendAppointmentConfirmation(updatedAppointment.patient.email, req.currentUser.name, {
        date: updatedAppointment.startsAt,
        reason: updatedAppointment.reason,
      }).catch(err => console.error('Failed to send confirmation notification:', err));
    } else if (newStatus === 'cancelled') {
      sendAppointmentCancellation(updatedAppointment.patient.email, {
        date: updatedAppointment.startsAt,
        reason: updatedAppointment.cancellationReason,
      }, 'the doctor').catch(err => console.error('Failed to send cancellation notification:', err));
    }

    return res.status(200).json(updatedAppointment);
  } catch (error) {
    return next(error);
  }
};
