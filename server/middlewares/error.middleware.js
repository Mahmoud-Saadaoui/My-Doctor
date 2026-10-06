const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode ?? error.status ?? 500;
  const messageKey = error.messageKey ?? 'errors.internalServerError';
  const translate = typeof req.t === 'function' ? req.t : key => key;
  const errors = error.errors?.map(item => ({
    field: item.field,
    messageKey: item.messageKey,
    message: translate(item.messageKey),
  }));

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: translate(messageKey),
    messageKey,
    language: req.language,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: error.stack } : {}),
  });
};

export default errorHandler;
