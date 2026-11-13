import productoRepository from '../models/producto.repository.js';

const repositories = Object.freeze({
  productos: productoRepository,
});

export function getRepository(resource) {
  const key = String(resource).toLowerCase();
  const repository = repositories[key];

  if (!repository) {
    throw new Error(`Repositorio no registrado: ${resource}`);
  }

  return repository;
}

export function getRegisteredResources() {
  return Object.keys(repositories);
}

export default getRepository;
