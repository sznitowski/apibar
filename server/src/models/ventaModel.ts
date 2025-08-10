// src/models/ventaModel.ts
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import logger from '../config/logger';

/** ===== Tipos ===== */
export interface ProductoVenta {
  id_producto: number;
  cantidad: number;
}

interface ProductoRow extends RowDataPacket {
  price: number;
  stock: number;
}

export interface DetalleConsumo extends RowDataPacket {
  id_venta: number;
  id_mesa: number;
  fecha: Date;
  tipo_pago: string;
  costo_total: number;
  id_producto: number;
  nombre_producto: string;
  descripcion_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface ResumenVenta extends RowDataPacket {
  id_venta: number;
  id_mesa: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  tipo_pago: string;
  costo_total: number;
}

export interface StockResumen extends RowDataPacket {
  id: number;
  name: string;
  category: string;
  price: number;
  stock_actual: number;
  total_vendido: number;
  stock_inicial: number;
}

/** Resultado para dashboard de ventas (query detallado) */
export interface VentaDetallada extends RowDataPacket {
  id_venta: number;
  id_mesa: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  tiempo_uso: number;
  tipo_pago: string;
  costo_total: number;

  id_producto: number;
  nombre_producto: string;
  categoria: string;
  precio_producto: number;

  cantidad: number;
  precio_unitario: number;
  subtotal_item: number;

  fecha: string;     // YYYY-MM-DD
  hora: number;
  dia_semana: string;
  semana_iso: number;
  mes: number;
  anio: number;

  items_por_venta: number;
  unidades_por_venta: number;
  subtotal_por_venta: number;
  pct_item_en_ticket: number;
  rank_item_importe: number;
  rank_item_cantidad: number;
}

/** ===== Registrar venta ===== */
export const registrarVenta = async (
  id_mesa: number,
  productos: ProductoVenta[],
  tipo_pago: string
): Promise<void> => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const fecha_inicio = new Date();
    const fecha_fin = new Date();
    const tiempo_uso = Math.floor((fecha_fin.getTime() - fecha_inicio.getTime()) / 1000);

    let costo_total = 0;

    for (const { id_producto, cantidad } of productos) {
      const [rows] = await conn.query<ProductoRow[]>(
        'SELECT price, stock FROM products WHERE id = ? FOR UPDATE',
        [id_producto]
      );
      const producto = rows[0];
      if (!producto || producto.stock < cantidad) {
        const msg = `Stock insuficiente para el producto ID ${id_producto}`;
        logger.error(msg, { id_producto, cantidad });
        throw new Error(msg);
      }
      costo_total += producto.price * cantidad;
    }

    const [ventaResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO ventas (id_mesa, fecha_inicio, fecha_fin, tiempo_uso, tipo_pago, costo_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_mesa, fecha_inicio, fecha_fin, tiempo_uso, tipo_pago, costo_total]
    );

    const id_venta = ventaResult.insertId;

    for (const { id_producto, cantidad } of productos) {
      const [prodRows] = await conn.query<ProductoRow[]>(
        'SELECT price FROM products WHERE id = ?',
        [id_producto]
      );
      const price = prodRows[0].price;

      await conn.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_venta, id_producto, cantidad, price]
      );

      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [cantidad, id_producto]
      );
    }

    await conn.commit();
    logger.info('Venta registrada con éxito', { id_venta, id_mesa, tipo_pago, costo_total, productos });
  } catch (error) {
    await conn.rollback();
    const err = error as Error;
    logger.error('Error al registrar venta', { error: err.message, stack: err.stack, id_mesa, tipo_pago, productos });
    throw err;
  } finally {
    conn.release();
  }
};

/** ===== Consumo detalle ===== */
export const obtenerConsumoDetalle = async (): Promise<DetalleConsumo[]> => {
  try {
    const [rows] = await pool.query<DetalleConsumo[]>(
      `SELECT
         v.id AS id_venta,
         v.id_mesa,
         v.fecha_inicio AS fecha,
         v.tipo_pago,
         v.costo_total,
         d.id_producto,
         p.name AS nombre_producto,
         p.description AS descripcion_producto,
         d.cantidad,
         d.precio_unitario,
         (d.cantidad * d.precio_unitario) AS subtotal
       FROM ventas v
       JOIN detalle_venta d ON v.id = d.id_venta
       JOIN products p ON d.id_producto = p.id
       ORDER BY v.fecha_inicio DESC, v.id`
    );
    return rows;
  } catch (error) {
    const err = error as Error;
    logger.error('Error en obtenerConsumoDetalle', { message: err.message, stack: err.stack });
    throw err;
  }
};

/** ===== Resumen ventas ===== */
export const obtenerResumenVentas = async (): Promise<ResumenVenta[]> => {
  try {
    const [rows] = await pool.query<ResumenVenta[]>(
      `SELECT
         v.id AS id_venta,
         v.id_mesa,
         v.fecha_inicio,
         v.fecha_fin,
         v.tipo_pago,
         v.costo_total
       FROM ventas v
       ORDER BY v.fecha_inicio DESC`
    );
    return rows;
  } catch (error) {
    const err = error as Error;
    logger.error('Error en obtenerResumenVentas', { message: err.message, stack: err.stack });
    throw err;
  }
};

/** ===== Stock resumen (con nombre y categoría) ===== */
export const obtenerStockResumen = async (): Promise<StockResumen[]> => {
  try {
    const [rows] = await pool.query<StockResumen[]>(
      `SELECT
         p.id,
         p.name       AS name,
         p.category   AS category,
         p.price      AS price,
         p.stock      AS stock_actual,
         IFNULL(SUM(d.cantidad), 0)             AS total_vendido,
         (p.stock + IFNULL(SUM(d.cantidad), 0)) AS stock_inicial
       FROM products p
       LEFT JOIN detalle_venta d ON d.id_producto = p.id
       GROUP BY p.id, p.name, p.category, p.price, p.stock
       ORDER BY p.name`
    );
    return rows;
  } catch (error) {
    const err = error as Error;
    logger.error('Error en obtenerStockResumen', { message: err.message, stack: err.stack });
    throw err;
  }
};

/** ===== Ventas detalladas para dashboard (con filtros opcionales) =====
 *  Params soportados: from, to (YYYY-MM-DD), mesa, categoria, pago
 */
export const obtenerVentasDetalladas = async (params?: {
  from?: string;
  to?: string;
  mesa?: number;
  categoria?: string;
  pago?: string;
}): Promise<VentaDetallada[]> => {
  const { from, to, mesa, categoria, pago } = params || {};

  const where: string[] = [];
  const bind: any[] = [];

  if (from) { where.push(`v.fecha_inicio >= ?`); bind.push(`${from} 00:00:00`); }
  if (to)   { where.push(`v.fecha_inicio <  ?`); bind.push(`${to} 00:00:00`); }
  if (typeof mesa === 'number') { where.push(`v.id_mesa = ?`); bind.push(mesa); }
  if (categoria) { where.push(`p.category = ?`); bind.push(categoria); }
  if (pago) { where.push(`v.tipo_pago = ?`); bind.push(pago); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    WITH base AS (
      SELECT
        v.id                              AS id_venta,
        v.id_mesa,
        v.fecha_inicio,
        v.fecha_fin,
        v.tiempo_uso,
        v.tipo_pago,
        v.costo_total,

        d.id_producto,
        p.name                            AS nombre_producto,
        p.category                        AS categoria,
        p.price                           AS precio_producto,
        d.cantidad,
        d.precio_unitario,
        (d.cantidad * d.precio_unitario)  AS subtotal_item,

        DATE(v.fecha_inicio)              AS fecha,
        HOUR(v.fecha_inicio)              AS hora,
        DAYNAME(v.fecha_inicio)           AS dia_semana,
        WEEK(v.fecha_inicio, 3)           AS semana_iso,
        MONTH(v.fecha_inicio)             AS mes,
        YEAR(v.fecha_inicio)              AS anio
      FROM ventas v
      JOIN detalle_venta d ON d.id_venta = v.id
      JOIN products p      ON p.id       = d.id_producto
      ${whereSql}
    ),
    venta_metrics AS (
      SELECT
        id_venta,
        COUNT(*)            AS items_por_venta,
        SUM(cantidad)       AS unidades_por_venta,
        SUM(subtotal_item)  AS subtotal_por_venta
      FROM base
      GROUP BY id_venta
    )
    SELECT
      b.*,
      vm.items_por_venta,
      vm.unidades_por_venta,
      vm.subtotal_por_venta,
      CASE WHEN vm.subtotal_por_venta > 0
           THEN ROUND(100 * b.subtotal_item / vm.subtotal_por_venta, 2)
           ELSE 0 END                     AS pct_item_en_ticket,
      ROW_NUMBER() OVER (PARTITION BY b.id_venta ORDER BY b.subtotal_item DESC) AS rank_item_importe,
      ROW_NUMBER() OVER (PARTITION BY b.id_venta ORDER BY b.cantidad      DESC) AS rank_item_cantidad
    FROM base b
    JOIN venta_metrics vm ON vm.id_venta = b.id_venta
    ORDER BY b.fecha_inicio DESC, b.id_venta, rank_item_importe
  `;

  try {
    const [rows] = await pool.query<VentaDetallada[]>(sql, bind);
    return rows;
  } catch (error) {
    const err = error as Error;
    logger.error('Error en obtenerVentasDetalladas', { message: err.message, stack: err.stack, params });
    throw err;
  }
};