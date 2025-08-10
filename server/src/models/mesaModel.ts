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
