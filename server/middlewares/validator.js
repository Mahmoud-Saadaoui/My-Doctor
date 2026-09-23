const { body, param, query, validationResult } = require('express-validator');

const userValidatorRules = () => [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must contain between 2 and 120 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must contain between 8 and 128 characters'),
  body('userType').optional().isIn(['doctor', 'normal']).withMessage('Invalid account type'),
  body('location.latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('specialization').if(body('userType').equals('doctor')).trim().notEmpty().withMessage('Specialization is required for doctors'),
  body('address').if(body('userType').equals('doctor')).trim().notEmpty().withMessage('Address is required for doctors'),
  body('phone').if(body('userType').equals('doctor')).trim().notEmpty().withMessage('Phone is required for doctors'),
  body('workingHours').if(body('userType').equals('doctor')).trim().notEmpty().withMessage('Working hours are required for doctors'),
];

const loginValidatorRules = () => [
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const doctorQueryRules = () => [
  query('q').optional().trim().isLength({ max: 100 }).withMessage('Search query is too long'),
  query('specialization').optional().trim().isLength({ max: 120 }).withMessage('Specialization is too long'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

const appointmentValidatorRules = () => [
  body('doctorId').isInt({ min: 1 }).withMessage('A valid doctor is required'),
  body('startsAt').isISO8601().withMessage('A valid start date is required'),
  body('endsAt').isISO8601().withMessage('A valid end date is required'),
  body('reason').optional().trim().isLength({ max: 2000 }).withMessage('Reason is too long'),
];

const appointmentIdRules = () => [
  param('id').isInt({ min: 1 }).withMessage('A valid appointment is required'),
];

const appointmentQueryRules = () => [
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).withMessage('Invalid appointment status'),
];

const availabilityValidatorRules = () => [
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
  body('startTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must use HH:mm format'),
  body('endTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must use HH:mm format'),
  body('timezone').optional().trim().isLength({ max: 80 }).withMessage('Timezone is too long'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    errors: errors.array().map(error => ({ field: error.path, message: error.msg })),
  });
};

module.exports = {
  userValidatorRules,
  loginValidatorRules,
  doctorQueryRules,
  appointmentValidatorRules,
  appointmentIdRules,
  appointmentQueryRules,
  availabilityValidatorRules,
  validate,
};
