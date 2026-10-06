import { body, param, query, validationResult } from 'express-validator';

const userValidatorRules = () => [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('validation.nameLength'),
  body('email').trim().isEmail().normalizeEmail().withMessage('validation.email'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('validation.passwordLength'),
  body('userType').optional().isIn(['doctor', 'normal']).withMessage('validation.accountType'),
  body('location.latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }).withMessage('validation.latitude'),
  body('location.longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }).withMessage('validation.longitude'),
  body('specialization').if(body('userType').equals('doctor')).trim().notEmpty().withMessage('validation.doctorSpecialization'),
  body('address').if(body('userType').equals('doctor')).trim().notEmpty().withMessage('validation.doctorAddress'),
  body('phone').if(body('userType').equals('doctor')).trim().notEmpty().withMessage('validation.doctorPhone'),
  body('workingHours').if(body('userType').equals('doctor')).trim().notEmpty().withMessage('validation.doctorWorkingHours'),
];

const loginValidatorRules = () => [
  body('email').trim().isEmail().normalizeEmail().withMessage('validation.email'),
  body('password').notEmpty().withMessage('validation.passwordRequired'),
];

const doctorQueryRules = () => [
  query('q').optional().trim().isLength({ max: 100 }).withMessage('validation.searchTooLong'),
  query('specialization').optional().trim().isLength({ max: 120 }).withMessage('validation.specializationTooLong'),
  query('page').optional().isInt({ min: 1 }).withMessage('validation.page'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('validation.limit'),
  query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('validation.latitude'),
  query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('validation.longitude'),
  query('radiusKm').optional().isFloat({ min: 0.1, max: 50 }).withMessage('validation.radius'),
  query('sort').optional().isIn(['name', 'distance']).withMessage('validation.sort'),
];

const appointmentValidatorRules = () => [
  body('doctorId').isInt({ min: 1 }).withMessage('validation.doctorRequired'),
  body('startsAt').isISO8601().withMessage('validation.startDate'),
  body('endsAt').isISO8601().withMessage('validation.endDate'),
  body('reason').optional().trim().isLength({ max: 2000 }).withMessage('validation.reasonTooLong'),
];

const appointmentIdRules = () => [
  param('id').isInt({ min: 1 }).withMessage('validation.appointmentRequired'),
];

const appointmentQueryRules = () => [
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).withMessage('validation.status'),
];

const availabilityValidatorRules = () => [
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('validation.dayOfWeek'),
  body('startTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('validation.startTime'),
  body('endTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('validation.endTime'),
  body('timezone').optional().trim().isLength({ max: 80 }).withMessage('validation.timezone'),
];

const updateProfileValidatorRules = () => [
  body('name').optional().trim().isLength({ min: 2, max: 120 }).withMessage('validation.nameLength'),
  body('password').optional().isLength({ min: 8, max: 128 }).withMessage('validation.passwordLength'),
  body('specialization').optional().trim().isLength({ max: 120 }).withMessage('validation.specializationTooLong'),
  body('address').optional().trim().isLength({ max: 255 }).withMessage('validation.addressTooLong'),
  body('workingHours').optional().trim().isLength({ max: 255 }).withMessage('validation.workingHoursTooLong'),
  body('phone').optional().trim().isLength({ max: 40 }).withMessage('validation.phoneTooLong'),
  body('location.latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }).withMessage('validation.latitude'),
  body('location.longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }).withMessage('validation.longitude'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: req.t('errors.validationFailed'),
    messageKey: 'errors.validationFailed',
    language: req.language,
    errors: errors.array().map(error => ({
      field: error.path,
      messageKey: error.msg,
      message: req.t(error.msg),
    })),
  });
};

export {
  userValidatorRules,
  loginValidatorRules,
  doctorQueryRules,
  appointmentValidatorRules,
  appointmentIdRules,
  appointmentQueryRules,
  availabilityValidatorRules,
  updateProfileValidatorRules,
  validate,
};
