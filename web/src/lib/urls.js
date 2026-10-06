export const SIGNUP_URL = "/account/signup";
export const SIGNIN_URL = "/account/login";
export const PROFILE_URL = "/account/profile";
export const DELETE_PROFILE_URL = "/account/delete-profile";
export const DOCTORS_URL = "/doctors";
export const UPDATE_PROFILE_URL = "/account/update-profile";
export const APPOINTMENTS_URL = "/appointments";

// Email verification
export const VERIFY_EMAIL_URL = "/account/verify-email";
export const FORGOT_PASSWORD_URL = "/account/forgot-password";
export const RESET_PASSWORD_URL = "/account/reset-password";

// Admin
export const ADMIN_PENDING_DOCTORS_URL = "/admin/doctors/pending";

export const doctorDetailsUrl = (doctorId) => `${DOCTORS_URL}/${doctorId}`;
export const doctorAvailabilityUrl = (doctorId) => `${doctorDetailsUrl(doctorId)}/availability`;
export const appointmentCancelUrl = (appointmentId) => `${APPOINTMENTS_URL}/${appointmentId}/cancel`;
export const appointmentStatusUrl = (appointmentId) => `${APPOINTMENTS_URL}/${appointmentId}/status`;
export const adminApproveDoctorUrl = (doctorId) => `/admin/doctors/${doctorId}/approve`;
export const adminRejectDoctorUrl = (doctorId) => `/admin/doctors/${doctorId}/reject`;
