import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

export function validate({ body, params, query } = {}) {
  return function validateRequest(req, res, next) {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }

      if (params) {
        req.params = params.parse(req.params);
      }

      if (query) {
        req.query = query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.') || null,
          message: issue.message,
        }));

        return next(
          ApiError.unprocessable('Datos de entrada inválidos', {
            code: 'VALIDATION_ERROR',
            details,
          }),
        );
      }

      return next(error);
    }
  };
}

export default validate;
