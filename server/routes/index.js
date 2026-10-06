import express from 'express';
import * as userController from '../controllers/userController.js';
import * as doctorController from '../controllers/doctorController.js';
import * as appointmentController from '../controllers/appointmentController.js';
import * as availabilityController from '../controllers/availabilityController.js';
import * as adminController from '../controllers/adminController.js';
import * as authController from '../controllers/authController.js';
import isLoggedIn from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import {
  userValidatorRules,
  loginValidatorRules,
  doctorQueryRules,
  appointmentValidatorRules,
  appointmentIdRules,
  appointmentQueryRules,
  availabilityValidatorRules,
  updateProfileValidatorRules,
  validate,
} from '../middlewares/validator.js';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ name: 'MyDoctor API', version: 'v1' });
});

router.post('/account/signup', userValidatorRules(), validate, userController.register);
router.post('/account/login', loginValidatorRules(), validate, userController.login);
router.get('/account/me', isLoggedIn, userController.me);
router.get('/account/profile', isLoggedIn, userController.getProfile);
router.put('/account/update-profile', isLoggedIn, updateProfileValidatorRules(), validate, userController.updateProfile);
router.delete('/account/delete-profile', isLoggedIn, userController.deleteProfile);

// Email verification & password reset
router.get('/account/verify-email', authController.verifyEmail);
router.post('/account/resend-verification', authController.resendVerification);
router.post('/account/forgot-password', authController.forgotPassword);
router.post('/account/reset-password', authController.resetPassword);

router.get('/doctors', doctorQueryRules(), validate, doctorController.index);
router.get('/doctors/:id', doctorController.show);
router.get('/doctors/:id/availability', doctorController.availability);
router.get('/doctors/:id/available-slots', availabilityController.getAvailableSlots);
router.post('/doctors/me/availability', isLoggedIn, availabilityValidatorRules(), validate, availabilityController.create);
router.delete('/doctors/me/availability/:availabilityId', isLoggedIn, availabilityController.destroy);

router.get('/appointments', isLoggedIn, appointmentQueryRules(), validate, appointmentController.index);
router.post('/appointments', isLoggedIn, appointmentValidatorRules(), validate, appointmentController.create);
router.patch('/appointments/:id/cancel', isLoggedIn, appointmentIdRules(), validate, appointmentController.cancel);
router.patch('/appointments/:id/status', isLoggedIn, appointmentIdRules(), validate, appointmentController.updateStatus);

// Admin routes - only accessible by users with the 'admin' role
router.get('/admin/doctors/pending', isLoggedIn, authorize('admin'), adminController.pendingDoctors);
router.patch('/admin/doctors/:id/approve', isLoggedIn, authorize('admin'), adminController.approveDoctor);
router.patch('/admin/doctors/:id/reject', isLoggedIn, authorize('admin'), adminController.rejectDoctor);

export default router;
