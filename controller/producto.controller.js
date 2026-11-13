import productoService from '../services/producto.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const productoController = {
  list: asyncHandler(async (req, res) => {
    const result = await productoService.list(req.pagination);
    res.status(200).json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const producto = await productoService.getById(req.params.id);
    res.status(200).json({ data: producto });
  }),

  create: asyncHandler(async (req, res) => {
    const producto = await productoService.create(req.body);
    res
      .status(201)
      .location(`${req.baseUrl}/${producto.id}`)
      .json({ data: producto });
  }),

  replace: asyncHandler(async (req, res) => {
    const producto = await productoService.replace(req.params.id, req.body);
    res.status(200).json({ data: producto });
  }),

  patch: asyncHandler(async (req, res) => {
    const producto = await productoService.patch(req.params.id, req.body);
    res.status(200).json({ data: producto });
  }),

  remove: asyncHandler(async (req, res) => {
    await productoService.remove(req.params.id);
    res.status(204).send();
  }),
};

export default productoController;
