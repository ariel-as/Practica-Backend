function normalizeString(value) {
  return value.replace(/\0/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function sanitizeObject(target, fields) {
  if (!target || typeof target !== 'object') {
    return target;
  }

  const sanitized = { ...target };

  for (const field of fields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = normalizeString(sanitized[field]);
    }
  }

  return sanitized;
}

export function sanitize({ body = [], params = [], query = [] } = {}) {
  return function sanitizeRequest(req, res, next) {
    if (body.length > 0) {
      req.body = sanitizeObject(req.body, body);
    }

    if (params.length > 0) {
      req.params = sanitizeObject(req.params, params);
    }

    if (query.length > 0) {
      req.query = sanitizeObject(req.query, query);
    }

    next();
  };
}

export default sanitize;
