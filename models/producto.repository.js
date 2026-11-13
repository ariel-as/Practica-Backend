import pool from '../config/database.js';
import ApiError from '../utils/ApiError.js';

const COLUMNS = 'id, nombre, categoria, precio_venta, stock, imagen';

const PATCHABLE_FIELDS = Object.freeze({
  nombre: 'nombre',
  categoria: 'categoria',
  precioVenta: 'precio_venta',
  stock: 'stock',
  imagen: 'imagen',
});

function mapRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    precioVenta: Number(row.precio_venta),
    stock: row.stock,
    imagen: row.imagen,
  };
}

async function execute(query, params = []) {
  try {
    return await pool.query(query, params);
  } catch (error) {
    if (error.code === '23514' || error.code === '23503') {
      throw ApiError.unprocessable('Los datos no cumplen las restricciones de la base de datos', {
        code: 'DB_CONSTRAINT_VIOLATION',
      });
    }

    throw error;
  }
}

async function findAll({ limit, offset }) {
  const { rows } = await execute(
    `SELECT ${COLUMNS} FROM productos ORDER BY id ASC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return rows.map(mapRow);
}

async function count() {
  const { rows } = await execute('SELECT COUNT(*)::integer AS total FROM productos');
  return rows[0].total;
}

async function findById(id) {
  const { rows } = await execute(`SELECT ${COLUMNS} FROM productos WHERE id = $1`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

async function create({ nombre, categoria, precioVenta, stock, imagen }) {
  const { rows } = await execute(
    `INSERT INTO productos (nombre, categoria, precio_venta, stock, imagen)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [nombre, categoria, precioVenta, stock, imagen ?? null],
  );

  return mapRow(rows[0]);
}

async function replace(id, { nombre, categoria, precioVenta, stock, imagen }) {
  const { rows } = await execute(
    `UPDATE productos
     SET nombre = $2, categoria = $3, precio_venta = $4, stock = $5, imagen = $6
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, nombre, categoria, precioVenta, stock, imagen ?? null],
  );

  return rows[0] ? mapRow(rows[0]) : null;
}

async function patch(id, data) {
  const entries = Object.entries(data).filter(([field]) => PATCHABLE_FIELDS[field]);

  if (entries.length === 0) {
    return findById(id);
  }

  const values = [id];
  const setClauses = entries.map(([field, value]) => {
    values.push(value);
    return `${PATCHABLE_FIELDS[field]} = $${values.length}`;
  });

  const { rows } = await execute(
    `UPDATE productos
     SET ${setClauses.join(', ')}
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    values,
  );

  return rows[0] ? mapRow(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await execute('DELETE FROM productos WHERE id = $1', [id]);
  return rowCount > 0;
}

const productoRepository = {
  findAll,
  count,
  findById,
  create,
  replace,
  patch,
  remove,
};

export default productoRepository;
