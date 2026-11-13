import { after, test } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5050/api/v1';
let createdId = null;

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { status: response.status, body };
}

after(async () => {
  if (createdId !== null) {
    await fetch(`${BASE_URL}/productos/${createdId}`, { method: 'DELETE' }).catch(() => {});
  }
});

test('GET /health responde 200', async () => {
  const response = await request('/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('GET /productos respeta la paginación', async () => {
  const response = await request('/productos?page=1&limit=5');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.data));
  assert.equal(response.body.pagination.page, 1);
  assert.equal(response.body.pagination.limit, 5);
  assert.ok(response.body.data.length <= 5);
  assert.equal(typeof response.body.pagination.total, 'number');
});

test('Rechaza paginación inválida', async () => {
  const response = await request('/productos?page=0');

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_PAGINATION');
});

test('Rechaza un precio de venta negativo', async () => {
  const response = await request('/productos', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Producto inválido',
      categoria: 'Prueba',
      precioVenta: -1,
    }),
  });

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('Rechaza un PATCH vacío', async () => {
  const response = await request('/productos/1', {
    method: 'PATCH',
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('Flujo CRUD completo de productos', async () => {
  const createResponse = await request('/productos', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Producto de prueba CI',
      categoria: 'Prueba automatizada',
      precioVenta: 19.99,
      stock: 4,
      imagen: 'https://example.com/producto-ci.png',
    }),
  });

  assert.equal(createResponse.status, 201);
  createdId = createResponse.body.data.id;
  assert.equal(createResponse.body.data.nombre, 'Producto de prueba CI');
  assert.equal(createResponse.body.data.precioVenta, 19.99);

  const getResponse = await request(`/productos/${createdId}`);
  assert.equal(getResponse.status, 200);
  assert.equal(getResponse.body.data.id, createdId);

  const putResponse = await request(`/productos/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre: 'Producto de prueba CI editado',
      categoria: 'Prueba automatizada 2',
      precioVenta: 25.5,
      stock: 8,
      imagen: null,
    }),
  });

  assert.equal(putResponse.status, 200);
  assert.equal(putResponse.body.data.nombre, 'Producto de prueba CI editado');
  assert.equal(putResponse.body.data.precioVenta, 25.5);
  assert.equal(putResponse.body.data.stock, 8);

  const patchResponse = await request(`/productos/${createdId}`, {
    method: 'PATCH',
    body: JSON.stringify({ stock: 12 }),
  });

  assert.equal(patchResponse.status, 200);
  assert.equal(patchResponse.body.data.stock, 12);

  const deleteResponse = await request(`/productos/${createdId}`, { method: 'DELETE' });
  assert.equal(deleteResponse.status, 204);
  createdId = null;

  const deletedResponse = await request(`/productos/${createResponse.body.data.id}`);
  assert.equal(deletedResponse.status, 404);
  assert.equal(deletedResponse.body.error.code, 'PRODUCTO_NOT_FOUND');
});
