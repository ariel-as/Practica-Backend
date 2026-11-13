export class ApiError extends Error {
  constructor(statusCode, message, { code = null, details = null, isOperational = true } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, options = {}) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', ...options });
  }

  static notFound(message, options = {}) {
    return new ApiError(404, message, { code: 'NOT_FOUND', ...options });
  }

  static conflict(message, options = {}) {
    return new ApiError(409, message, { code: 'CONFLICT', ...options });
  }

  static unprocessable(message, options = {}) {
    return new ApiError(422, message, { code: 'UNPROCESSABLE_ENTITY', ...options });
  }

  static internal(message = 'Error interno del servidor', options = {}) {
    return new ApiError(500, message, {
      code: 'INTERNAL_ERROR',
      isOperational: false,
      ...options,
    });
  }
}

export default ApiError;
