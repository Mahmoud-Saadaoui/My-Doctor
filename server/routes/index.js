const express = require('express');
const userController = require('../controllers/userController');
const doctorController = require('../controllers/doctorController');
const appointmentController = require('../controllers/appointmentController');
const availabilityController = require('../controllers/availabilityController');
const isLoggedIn = require('../middlewares/auth');
const {
  userValidatorRules,
  loginValidatorRules,
  doctorQueryRules,
  appointmentValidatorRules,
  appointmentIdRules,
  appointmentQueryRules,
  availabilityValidatorRules,
  validate,
} = require('../middlewares/validator');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ name: 'MyDoctor API', version: 'v1' });
});

router.post('/account/signup', userValidatorRules(), validate, userController.register);
router.post('/account/login', loginValidatorRules(), validate, userController.login);
router.get('/account/me', isLoggedIn, userController.me);
router.get('/account/profile', isLoggedIn, userController.getProfile);
router.put('/account/update-profile', isLoggedIn, userController.updateProfile);
router.delete('/account/delete-profile', isLoggedIn, userController.deleteProfile);

router.get('/doctors', doctorQueryRules(), validate, doctorController.index);
router.get('/doctors/:id', doctorController.show);
router.get('/doctors/:id/availability', doctorController.availability);
router.post('/doctors/me/availability', isLoggedIn, availabilityValidatorRules(), validate, availabilityController.create);
router.delete('/doctors/me/availability/:availabilityId', isLoggedIn, availabilityController.destroy);

router.get('/appointments', isLoggedIn, appointmentQueryRules(), validate, appointmentController.index);
router.post('/appointments', isLoggedIn, appointmentValidatorRules(), validate, appointmentController.create);
router.patch('/appointments/:id/cancel', isLoggedIn, appointmentIdRules(), validate, appointmentController.cancel);
router.patch('/appointments/:id/status', isLoggedIn, appointmentIdRules(), validate, appointmentController.updateStatus);

module.exports = router;
