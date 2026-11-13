import { z } from 'zod';

const nombreSchema = z
  .string({ error: 'El nombre es obligatorio' })
  .trim()
  .min(1, 'El nombre no puede estar vacío')
  .max(100, 'El nombre no puede superar los 100 caracteres');

const categoriaSchema = z
  .string({ error: 'La categoría es obligatoria' })
  .trim()
  .min(1, 'La categoría no puede estar vacía')
  .max(50, 'La categoría no puede superar los 50 caracteres');

const precioVentaSchema = z.coerce
  .number({ error: 'El precio de venta debe ser numérico' })
  .finite('El precio de venta debe ser un número finito')
  .nonnegative('El precio de venta no puede ser negativo');

const stockSchema = z.coerce
  .number({ error: 'El stock debe ser numérico' })
  .int('El stock debe ser un entero')
  .nonnegative('El stock no puede ser negativo')
  .max(Number.MAX_SAFE_INTEGER, 'El stock es demasiado grande');

const imagenSchema = z
  .string({ error: 'La imagen debe ser una cadena de texto' })
  .trim()
  .max(500, 'La imagen no puede superar los 500 caracteres')
  .nullable()
  .optional()
  .transform((value) => (value === '' ? null : value));

export const productoIdSchema = z
  .object({
    id: z.coerce
      .number({ error: 'El id debe ser numérico' })
      .int('El id debe ser un entero')
      .positive('El id debe ser mayor que cero'),
  })
  .strict();

export const createProductoSchema = z
  .object({
    nombre: nombreSchema,
    categoria: categoriaSchema,
    precioVenta: precioVentaSchema,
    stock: stockSchema.optional().default(0),
    imagen: imagenSchema,
  })
  .strict();

export const updateProductoSchema = z
  .object({
    nombre: nombreSchema,
    categoria: categoriaSchema,
    precioVenta: precioVentaSchema,
    stock: stockSchema,
    imagen: imagenSchema,
  })
  .strict();

export const patchProductoSchema = z
  .object({
    nombre: nombreSchema.optional(),
    categoria: categoriaSchema.optional(),
    precioVenta: precioVentaSchema.optional(),
    stock: stockSchema.optional(),
    imagen: imagenSchema,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Debe enviar al menos un campo para actualizar',
  });
