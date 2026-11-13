import ApiError from '../utils/ApiError.js';

const ALLOWED_QUERY_PARAMS = new Set(['page', 'limit']);

function parseInteger(value, field, { defaultValue, min, max }) {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  if (!/^\d+$/.test(String(value))) {
    throw ApiError.badRequest(`El parámetro ${field} debe ser un entero positivo`, {
      code: 'INVALID_PAGINATION',
      details: { field },
    });
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw ApiError.badRequest(
      `El parámetro ${field} debe estar entre ${min} y ${max}`,
      {
        code: 'INVALID_PAGINATION',
        details: { field },
      },
    );
  }

  return parsed;
}

export function pagination(req, res, next) {
  try {
    const unknownParams = Object.keys(req.query).filter(
      (key) => !ALLOWED_QUERY_PARAMS.has(key),
    );

    if (unknownParams.length > 0) {
      throw ApiError.badRequest('Parámetros de consulta no permitidos', {
        code: 'INVALID_QUERY',
        details: { params: unknownParams },
      });
    }

    const defaultLimit = Math.max(
      1,
      Number.parseInt(process.env.PAGINATION_DEFAULT_LIMIT, 10) || 10,
    );
    const maxLimit = Math.max(
      defaultLimit,
      Number.parseInt(process.env.PAGINATION_MAX_LIMIT, 10) || 100,
    );

    const page = parseInteger(req.query.page, 'page', {
      defaultValue: 1,
      min: 1,
      max: 1000000,
    });

    const limit = parseInteger(req.query.limit, 'limit', {
      defaultValue: defaultLimit,
      min: 1,
      max: maxLimit,
    });

    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export default pagination;
