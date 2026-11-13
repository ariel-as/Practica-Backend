import { Router } from 'express';
import productoController from '../controller/producto.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { sanitize } from '../middleware/sanitize.middleware.js';
import { pagination } from '../middleware/pagination.middleware.js';
import {
  createProductoSchema,
  patchProductoSchema,
  productoIdSchema,
  updateProductoSchema,
} from '../schemas/producto.schema.js';
import ApiError from '../utils/ApiError.js';

const router = Router();
const sanitizeProductoBody = sanitize({ body: ['nombre', 'categoria', 'imagen'] });

function methodNotAllowed(req, res, next) {
  next(
    new ApiError(405, `Método ${req.method} no permitido para esta ruta`, {
      code: 'METHOD_NOT_ALLOWED',
    }),
  );
}

router.get('/', pagination, productoController.list);
router.post(
  '/',
  sanitizeProductoBody,
  validate({ body: createProductoSchema }),
  productoController.create,
);
router.all('/', methodNotAllowed);

router.get('/:id', validate({ params: productoIdSchema }), productoController.getById);
router.put(
  '/:id',
  sanitizeProductoBody,
  validate({ params: productoIdSchema, body: updateProductoSchema }),
  productoController.replace,
);
router.patch(
  '/:id',
  sanitizeProductoBody,
  validate({ params: productoIdSchema, body: patchProductoSchema }),
  productoController.patch,
);
router.delete('/:id', validate({ params: productoIdSchema }), productoController.remove);
router.all('/:id', methodNotAllowed);

export default router;
