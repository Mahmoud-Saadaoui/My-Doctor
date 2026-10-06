export class AppError extends Error {
  constructor(statusCode, messageKey, details = undefined) {
    super(messageKey);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.messageKey = messageKey;
    this.details = details;
  }
}
