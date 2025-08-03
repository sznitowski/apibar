import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import logger from '../config/logger';

interface ProductoVenta {
  id_producto: number;
  cantidad: number;
}

interface Producto extends RowDataPacket {
  price: number;
  stock: number;
}

export const registrarVenta = async (
  id_mesa: number,
  productos: ProductoVenta[],
  tipo_pago: string
): Promise<void> => {
  console.log('🛒 Iniciando registro de venta...');
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    console.log('🧾 Transacción iniciada');

    const fecha_inicio = new Date();
    const fecha_fin = new Date(); // se puede ajustar luego para registrar duración real
    const tiempo_uso = Math.floor((fecha_fin.getTime() - fecha_inicio.getTime()) / 1000);

    let costo_total = 0;

    for (const { id_producto, cantidad } of productos) {
      const [rows] = await conn.query<Producto[]>(
        'SELECT price, stock FROM products WHERE id = ? FOR UPDATE',
        [id_producto]
      );
      const producto = rows[0];

      if (!producto || producto.stock < cantidad) {
        const msg = `❌ Stock insuficiente para el producto ID ${id_producto}`;
        console.error(msg);
        logger.error(msg, { id_producto, cantidad });
        throw new Error(msg);
      }

      costo_total += producto.price * cantidad;

      console.log(`✔ Producto ID ${id_producto}: precio $${producto.price}, cantidad ${cantidad}`);
    }

    const [ventaResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO ventas (id_mesa, fecha_inicio, fecha_fin, tiempo_uso, tipo_pago, costo_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_mesa, fecha_inicio, fecha_fin, tiempo_uso, tipo_pago, costo_total]
    );

    const id_venta = ventaResult.insertId;
    console.log(`📝 Venta registrada con ID ${id_venta}, total: $${costo_total}`);

    for (const { id_producto, cantidad } of productos) {
      const [prodRows] = await conn.query<Producto[]>(
        'SELECT price FROM products WHERE id = ?',
        [id_producto]
      );
      const producto = prodRows[0];
      const price = producto.price;

      await conn.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_venta, id_producto, cantidad, price]
      );

      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [cantidad, id_producto]
      );

      console.log(`📦 Producto ${id_producto} agregado al detalle y stock actualizado`);
    }

    await conn.commit();
    console.log('✅ Transacción completada con éxito');

    logger.info('Venta registrada con éxito', {
      id_venta,
      id_mesa,
      tipo_pago,
      costo_total,
      productos
    });

  } catch (error) {
    await conn.rollback();
    console.error('💥 Error en la transacción, realizando rollback:', (error as Error).message);

    logger.error('Error al registrar venta', {
      error: (error as Error).message,
      id_mesa,
      tipo_pago,
      productos
    });

    throw error;
  } finally {
    conn.release();
    console.log('🔚 Conexión liberada');
  }
};
