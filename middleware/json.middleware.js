import express from 'express';
import ApiError from '../utils/ApiError.js';

const jsonParser = express.json({
  limit: process.env.JSON_LIMIT || '1mb',
  strict: true,
});

export function jsonMiddleware(req, res, next) {
  const methodsWithBody = new Set(['POST', 'PUT', 'PATCH']);

  if (methodsWithBody.has(req.method) && !req.is('application/json')) {
    return next(
      new ApiError(415, 'El tipo de contenido debe ser application/json', {
        code: 'UNSUPPORTED_MEDIA_TYPE',
      }),
    );
  }

  return jsonParser(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.type === 'entity.parse.failed') {
      return next(
        ApiError.badRequest('El cuerpo de la solicitud no contiene un JSON válido', {
          code: 'INVALID_JSON',
        }),
      );
    }

    if (error.type === 'entity.too.large') {
      return next(
        new ApiError(413, 'El cuerpo de la solicitud supera el tamaño permitido', {
          code: 'PAYLOAD_TOO_LARGE',
        }),
      );
    }

    if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') {
      return next(
        new ApiError(415, 'La codificación del cuerpo no está soportada', {
          code: 'UNSUPPORTED_MEDIA_TYPE',
        }),
      );
    }

    return next(error);
  });
}

export default jsonMiddleware;
