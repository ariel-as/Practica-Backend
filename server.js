import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import corsMiddleware from './middleware/cors.middleware.js';
import jsonMiddleware from './middleware/json.middleware.js';
import notFoundMiddleware from './middleware/not-found.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import apiRoutes from './route/index.routes.js';
import { checkDatabaseConnection, closePool } from './config/database.js';

const app = express();
const apiVersion = process.env.API_VERSION || 'v1';
const port = Number(process.env.PORT || 5050);

const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  limit: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes. Intente nuevamente más tarde.',
      details: null,
    },
  },
});

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(jsonMiddleware);

app.use(`/api/${apiVersion}`, apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}/api/${apiVersion}`);

  checkDatabaseConnection()
    .then(() => console.log('Conexión a PostgreSQL verificada'))
    .catch((error) => {
      console.warn('No se pudo verificar la conexión a PostgreSQL:', error.message);
    });
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Señal ${signal} recibida. Cerrando servidor...`);

  const forceExitTimer = setTimeout(() => {
    console.error('El cierre ordenado excedió el tiempo límite. Forzando salida.');
    process.exit(1);
  }, 10000);

  forceExitTimer.unref();

  server.close(async (error) => {
    try {
      await closePool();
    } catch (poolError) {
      console.error('Error al cerrar el pool de PostgreSQL:', poolError.message);
    }

    clearTimeout(forceExitTimer);

    if (error) {
      console.error('Error al cerrar el servidor HTTP:', error.message);
      process.exit(1);
    }

    console.log('Cierre completado correctamente');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Promesa rechazada no controlada:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  shutdown('uncaughtException');
});
