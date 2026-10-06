/**
 * Authorization middleware factory.
 *
 * Restricts route access to specific user types.
 * Must be used AFTER the isLoggedIn authentication middleware.
 *
 * @param {...string} allowedTypes - User types allowed to access the route
 * @returns {Function} Express middleware function
 *
 * @example
 * // Only administrators can access this route
 * router.get('/admin', isLoggedIn, authorize('admin'), adminController.index);
 *
 * @example
 * // Both doctors and administrators can access this route
 * router.get('/dashboard', isLoggedIn, authorize('doctor', 'admin'), dashboardController.index);
 */
const authorize = (...allowedTypes) => {
  return (req, res, next) => {
    // Ensure the user is authenticated (isLoggedIn should run first)
    if (!req.currentUser) {
      return res.status(401).json({
        message: req.t('auth.authenticationRequired'),
        messageKey: 'auth.authenticationRequired',
        language: req.language,
      });
    }

    // Check if the user's type is in the allowed list
    if (!allowedTypes.includes(req.currentUser.userType)) {
      return res.status(403).json({
        message: req.t('auth.forbidden'),
        messageKey: 'auth.forbidden',
        language: req.language,
      });
    }

    next();
  };
};

export default authorize;
