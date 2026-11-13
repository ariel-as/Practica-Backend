import ApiError from '../utils/ApiError.js';

export function notFoundMiddleware(req, res, next) {
  next(
    ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
      code: 'ROUTE_NOT_FOUND',
    }),
  );
}

export default notFoundMiddleware;
