import cors from 'cors';
import ApiError from '../utils/ApiError.js';

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new ApiError(403, 'Origen no permitido por la política CORS', {
        code: 'CORS_ORIGIN_NOT_ALLOWED',
      }),
    );
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
