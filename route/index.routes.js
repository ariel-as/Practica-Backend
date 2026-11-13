import { Router } from 'express';
import productoRoutes from './producto.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.use('/productos', productoRoutes);

export default router;
