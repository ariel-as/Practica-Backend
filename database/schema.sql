CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  precio_venta NUMERIC NOT NULL CHECK (precio_venta >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagen VARCHAR(500)
);
