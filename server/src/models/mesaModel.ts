import pool from '../config/database';
import { ResultSetHeader } from 'mysql2';
import logger from '../config/logger';

// Obtener todas las mesas
export const getAllMesas = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM mesas');
    logger.info('Mesas fetched successfully');
    console.log('✅ Mesas fetched');
    return rows;
  } catch (error) {
    logger.error('Error fetching mesas', { error });
    console.error('❌ Error fetching mesas:', error);
    throw error;
  }
};

// Obtener mesa por ID
export const getMesaById = async (id: number) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mesas WHERE id = ?', [id]);
    logger.info(`Mesa ${id} fetched successfully`);
    console.log(`✅ Mesa ${id} fetched`);
    return Array.isArray(rows) ? rows[0] : null;
  } catch (error) {
    logger.error(`Error fetching mesa ${id}`, { error });
    console.error(`❌ Error fetching mesa ${id}:`, error);
    throw error;
  }
};

// Crear nueva mesa
export const createMesa = async (capacidad: number, ubicacion: string) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO mesas (capacidad, estado, ubicacion) VALUES (?, "disponible", ?)',
      [capacidad, ubicacion]
    );
    logger.info(`Mesa creada ID ${result.insertId}, capacidad: ${capacidad}, ubicación: ${ubicacion}`);
    console.log(`✅ Mesa creada ID ${result.insertId}, capacidad: ${capacidad}, ubicación: ${ubicacion}`);
    return result.insertId;
  } catch (error) {
    logger.error('Error creando mesa', { error });
    console.error('❌ Error creando mesa:', error);
    throw error;
  }
};

// Actualizar mesa
export const updateMesa = async (id: number, capacidad: number, ubicacion: string) => {
  try {
    await pool.query(
      'UPDATE mesas SET capacidad = ?, ubicacion = ? WHERE id = ?',
      [capacidad, ubicacion, id]
    );
    logger.info(`Mesa actualizada ID ${id}, capacidad: ${capacidad}, ubicación: ${ubicacion}`);
    console.log(`✅ Mesa actualizada ID ${id}, capacidad: ${capacidad}, ubicación: ${ubicacion}`);
  } catch (error) {
    logger.error(`Error actualizando mesa ${id}`, { error });
    console.error(`❌ Error actualizando mesa ${id}:`, error);
    throw error;
  }
};

// Eliminar mesa
export const deleteMesa = async (id: number) => {
  try {
    await pool.query('DELETE FROM mesas WHERE id = ?', [id]);
    logger.info(`Mesa eliminada ID ${id}`);
    console.log(`✅ Mesa eliminada ID ${id}`);
  } catch (error) {
    logger.error(`Error eliminando mesa ${id}`, { error });
    console.error(`❌ Error eliminando mesa ${id}:`, error);
    throw error;
  }
};

// Obtener mesas con consumo total
export const getMesasConsumo = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, SUM(c.cantidad * p.price) AS total_consumo
      FROM mesas m
      LEFT JOIN consumos c ON m.id = c.id_mesa
      LEFT JOIN products p ON c.id_producto = p.id
      GROUP BY m.id
    `);
    logger.info('Mesas con consumo fetched');
    console.log('✅ Mesas con consumo fetched');
    return rows;
  } catch (error) {
    logger.error('Error fetching mesas con consumo', { error });
    console.error('❌ Error fetching mesas con consumo:', error);
    throw error;
  }
};

// Asociar consumo a mesa
export const setConsumoForMesa = async (id_mesa: number, productIds: number[]) => {
  try {
    for (const id_producto of productIds) {
      await pool.query(
        `INSERT INTO consumos (id_mesa, id_producto, cantidad) VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE cantidad = cantidad + 1`,
        [id_mesa, id_producto]
      );
    }
    logger.info(`Consumo actualizado para mesa ID ${id_mesa} con productos ${productIds.join(', ')}`);
    console.log(`✅ Consumo actualizado para mesa ID ${id_mesa} con productos ${productIds.join(', ')}`);
  } catch (error) {
    logger.error(`Error actualizando consumo en mesa ${id_mesa}`, { error });
    console.error(`❌ Error actualizando consumo en mesa ${id_mesa}:`, error);
    throw error;
  }
};

// Obtener todos los productos
export const getAllProductos = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    logger.info('Productos obtenidos');
    console.log('✅ Productos obtenidos');
    return rows;
  } catch (error) {
    logger.error('Error obteniendo productos', { error });
    console.error('❌ Error obteniendo productos:', error);
    throw error;
  }
};

// Crear consumo nuevo
export const createConsumo = async (
  id_mesa: number,
  id_producto: number,
  cantidad: number
) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO consumos (id_mesa, id_producto, cantidad) VALUES (?, ?, ?)',
      [id_mesa, id_producto, cantidad]
    );
    logger.info(`Nuevo consumo en mesa ${id_mesa}: producto ${id_producto}, cantidad ${cantidad}`);
    console.log(`✅ Nuevo consumo en mesa ${id_mesa}: producto ${id_producto}, cantidad ${cantidad}`);
    return result.insertId;
  } catch (error) {
    logger.error('Error creando consumo', { error });
    console.error('❌ Error creando consumo:', error);
    throw error;
  }
};
