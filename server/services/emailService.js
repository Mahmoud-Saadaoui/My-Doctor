/**
 * Email service for sending transactional emails.
 *
 * Uses Nodemailer with SMTP. Configuration via environment variables:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 *
 * In development (NODE_ENV !== 'production'), emails are logged to console
 * instead of being sent, unless SMTP is explicitly configured.
 */

import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.EMAIL_FROM || 'noreply@mydoctor.com';

  // In development without SMTP configured, log to console
  if (process.env.NODE_ENV !== 'production') {
    const t = getTransporter();
    if (!t) {
      console.log('=== EMAIL (development mode) ===');
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text}`);
      console.log('=================================');
      return { success: true, messageId: `dev-${Date.now()}` };
    }
  }

  const t = getTransporter();

  if (!t) {
    console.error('Email service not configured: SMTP_HOST and SMTP_PORT are required');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const info = await t.sendMail({ from, to, subject, text, html });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log error without sensitive data (no email content, no tokens)
    console.error(`Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment request notification to doctor
 */
export const sendAppointmentRequestNotification = async (doctorEmail, patientName, appointmentDetails) => {
  return sendEmail({
    to: doctorEmail,
    subject: 'New Appointment Request - MyDoctor',
    text: `Dr.,\n\nYou have a new appointment request from ${patientName}.\n\nDetails:\n${JSON.stringify(appointmentDetails, null, 2)}\n\nPlease log in to confirm or reject this request.\n\nBest regards,\nMyDoctor Team`,
  });
};

/**
 * Send appointment confirmation to patient
 */
export const sendAppointmentConfirmation = async (patientEmail, doctorName, appointmentDetails) => {
  return sendEmail({
    to: patientEmail,
    subject: 'Appointment Confirmed - MyDoctor',
    text: `Dear patient,\n\nYour appointment with Dr. ${doctorName} has been confirmed.\n\nDetails:\n${JSON.stringify(appointmentDetails, null, 2)}\n\nBest regards,\nMyDoctor Team`,
  });
};

/**
 * Send appointment cancellation notification
 */
export const sendAppointmentCancellation = async (email, appointmentDetails, cancelledBy) => {
  return sendEmail({
    to: email,
    subject: 'Appointment Cancelled - MyDoctor',
    text: `Dear user,\n\nThe following appointment has been cancelled by ${cancelledBy}:\n\n${JSON.stringify(appointmentDetails, null, 2)}\n\nBest regards,\nMyDoctor Team`,
  });
};

/**
 * Send appointment rejection notification
 */
export const sendAppointmentRejection = async (patientEmail, doctorName, reason) => {
  return sendEmail({
    to: patientEmail,
    subject: 'Appointment Request Declined - MyDoctor',
    text: `Dear patient,\n\nUnfortunately, Dr. ${doctorName} is unable to accept your appointment request.\n\nReason: ${reason || 'No reason provided'}\n\nPlease try booking with another doctor or at a different time.\n\nBest regards,\nMyDoctor Team`,
  });
};

/**
 * Send email verification link
 */
export const sendVerificationEmail = async (email, name, verificationLink) => {
  return sendEmail({
    to: email,
    subject: 'Verify your email - MyDoctor',
    text: `Dear ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.\n\nBest regards,\nMyDoctor Team`,
  });
};

/**
 * Send password reset link
 */
export const sendPasswordResetEmail = async (email, name, resetLink) => {
  return sendEmail({
    to: email,
    subject: 'Password Reset - MyDoctor',
    text: `Dear ${name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nMyDoctor Team`,
  });
};

export default {
  sendEmail,
  sendAppointmentRequestNotification,
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentRejection,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
