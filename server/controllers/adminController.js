/**
 * Admin controller.
 *
 * Handles administrator operations such as verifying doctor profiles.
 * All routes using this controller must be protected with:
 *   - isLoggedIn (authentication)
 *   - authorize('admin') (authorization)
 */

import prisma from '../config/db.js';

/**
 * List all doctor profiles pending verification.
 *
 * GET /api/v1/admin/doctors/pending
 */
export const pendingDoctors = async (req, res, next) => {
  try {
    const pendingDoctors = await prisma.user.findMany({
      where: {
        userType: 'doctor',
        profile: {
          is: {
            isVerified: false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            specialization: true,
            address: true,
            phone: true,
            bio: true,
            consultationFee: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.status(200).json(pendingDoctors);
  } catch (error) {
    return next(error);
  }
};

/**
 * Approve a doctor profile.
 *
 * PATCH /api/v1/admin/doctors/:id/approve
 */
export const approveDoctor = async (req, res, next) => {
  try {
    const doctorId = Number(req.params.id);

    // Verify the doctor exists
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        userType: 'doctor',
      },
      select: {
        id: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        message: req.t('admin.doctorNotFound'),
        messageKey: 'admin.doctorNotFound',
        language: req.language,
      });
    }

    // Mark the doctor's profile as verified
    await prisma.profile.update({
      where: {
        userId: doctorId,
      },
      data: {
        isVerified: true,
      },
    });

    return res.status(200).json({
      message: req.t('admin.doctorApproved'),
      messageKey: 'admin.doctorApproved',
      language: req.language,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reject a doctor profile (set isVerified to false).
 *
 * PATCH /api/v1/admin/doctors/:id/reject
 */
export const rejectDoctor = async (req, res, next) => {
  try {
    const doctorId = Number(req.params.id);

    // Verify the doctor exists
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        userType: 'doctor',
      },
      select: {
        id: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        message: req.t('admin.doctorNotFound'),
        messageKey: 'admin.doctorNotFound',
        language: req.language,
      });
    }

    // Mark the doctor's profile as not verified
    await prisma.profile.update({
      where: {
        userId: doctorId,
      },
      data: {
        isVerified: false,
      },
    });

    return res.status(200).json({
      message: req.t('admin.doctorRejected'),
      messageKey: 'admin.doctorRejected',
      language: req.language,
    });
  } catch (error) {
    return next(error);
  }
};
