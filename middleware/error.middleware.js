import ApiError from '../utils/ApiError.js';

const STATUS_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

export function errorMiddleware(error, req, res, next) {
  const isOperational = error instanceof ApiError && error.isOperational;
  const statusCode = isOperational ? error.statusCode : 500;

  if (!isOperational) {
    console.error('Error no controlado:', {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    });
  }

  const message = isOperational ? error.message : 'Error interno del servidor';
  const code = isOperational ? error.code || STATUS_CODES[statusCode] : 'INTERNAL_ERROR';
  const details = isOperational ? error.details || null : null;

  if (res.headersSent) {
    return next(error);
  }

  return res.status(statusCode).json({
    error: {
      code: code || STATUS_CODES[statusCode] || 'ERROR',
      message,
      details,
    },
  });
}

export default errorMiddleware;
