import { getRepository } from '../factories/repository.factory.js';
import ApiError from '../utils/ApiError.js';

const productoRepository = getRepository('productos');

async function list({ page, limit, offset }) {
  const [data, total] = await Promise.all([
    productoRepository.findAll({ limit, offset }),
    productoRepository.count(),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

async function getById(id) {
  const producto = await productoRepository.findById(id);

  if (!producto) {
    throw ApiError.notFound('Producto no encontrado', { code: 'PRODUCTO_NOT_FOUND' });
  }

  return producto;
}

async function create(payload) {
  return productoRepository.create(payload);
}

async function replace(id, payload) {
  await getById(id);
  const updated = await productoRepository.replace(id, payload);

  if (!updated) {
    throw ApiError.notFound('Producto no encontrado', { code: 'PRODUCTO_NOT_FOUND' });
  }

  return updated;
}

async function patch(id, payload) {
  await getById(id);
  const updated = await productoRepository.patch(id, payload);

  if (!updated) {
    throw ApiError.notFound('Producto no encontrado', { code: 'PRODUCTO_NOT_FOUND' });
  }

  return updated;
}

async function remove(id) {
  const deleted = await productoRepository.remove(id);

  if (!deleted) {
    throw ApiError.notFound('Producto no encontrado', { code: 'PRODUCTO_NOT_FOUND' });
  }
}

const productoService = {
  list,
  getById,
  create,
  replace,
  patch,
  remove,
};

export default productoService;
