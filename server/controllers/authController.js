import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import prisma from '../config/db.js';

/**
 * Email verification controller.
 *
 * Handles email verification flow:
 * - verifyEmail: verifies a user's email using a token
 * - resendVerification: sends a new verification email
 */

export const verifyEmail = async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      message: req.t('auth.invalidVerificationToken'),
      messageKey: 'auth.invalidVerificationToken',
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: req.t('auth.invalidVerificationToken'),
        messageKey: 'auth.invalidVerificationToken',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return res.status(200).json({
      message: req.t('auth.emailVerified'),
      messageKey: 'auth.emailVerified',
    });
  } catch (error) {
    return next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        message: req.t('auth.verificationEmailSent'),
        messageKey: 'auth.verificationEmailSent',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: req.t('auth.emailVerified'),
        messageKey: 'auth.emailVerified',
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // TODO: Send actual email with verification link
    // For now, we just update the token
    console.log(`Verification link: /verify-email?token=${verificationToken}`);

    return res.status(200).json({
      message: req.t('auth.verificationEmailSent'),
      messageKey: 'auth.verificationEmailSent',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Password reset controller.
 *
 * Handles password reset flow:
 * - forgotPassword: sends a password reset link
 * - resetPassword: resets password using a token
 */

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        message: req.t('auth.passwordResetSent'),
        messageKey: 'auth.passwordResetSent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // TODO: Send actual email with reset link
    // For now, we just update the token
    console.log(`Password reset link: /reset-password?token=${resetToken}`);

    return res.status(200).json({
      message: req.t('auth.passwordResetSent'),
      messageKey: 'auth.passwordResetSent',
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: req.t('auth.invalidResetToken'),
      messageKey: 'auth.invalidResetToken',
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: req.t('auth.invalidResetToken'),
        messageKey: 'auth.invalidResetToken',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(password, 12),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return res.status(200).json({
      message: req.t('auth.passwordReset'),
      messageKey: 'auth.passwordReset',
    });
  } catch (error) {
    return next(error);
  }
};
