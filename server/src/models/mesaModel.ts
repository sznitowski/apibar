import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import logger from '../config/logger';

interface Mesa extends RowDataPacket {
  id?: number;
  capacidad: string;
  estado: string;
  ubicacion: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getAllMesas = async (): Promise<Mesa[]> => {
  try {
    const [rows] = await pool.query<Mesa[]>('SELECT * FROM mesas');
    return rows;
  } catch (error) {
    logger.error(`Error fetching mesas: ${error}`);
    throw new Error('Error fetching mesas');
  }
};

export const getMesaById = async (id: number): Promise<Mesa | null> => {
  try {
    const [rows] = await pool.query<Mesa[]>('SELECT * FROM mesas WHERE id = ?', [id]);
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (error) {
    logger.error(`Error fetching mesa: ${error}`);
    throw new Error('Error fetching mesa');
  }
};

export const createMesa = async (capacidad: string, estado: string, ubicacion: string): Promise<number> => {
  try {
    const [result] = await pool.query<any>(
      'INSERT INTO mesas (capacidad, estado, ubicacion) VALUES (?, ?)', 
      [capacidad, estado, ubicacion]
    );
    return result.insertId;
  } catch (error) {
    logger.error(`Error creating mesa: ${error}`);
    throw new Error('Error creating mesa');
  }
};

export const updateMesa = async (id: number, capacidad: string, estado: string, ubicacion: string): Promise<void> => {
  try {
    await pool.query(
      'UPDATE mesas SET capacidad = ?, estado = ?, ubicacion = ? WHERE id = ?', 
      [capacidad, estado, ubicacion, id]
    );
  } catch (error) {
    logger.error(`Error updating mesa: ${error}`);
    throw new Error('Error updating mesa');
  }
};

export const deleteMesa = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM mesas WHERE id = ?', [id]);
  } catch (error) {
    logger.error(`Error deleting mesa: ${error}`);
    throw new Error('Error deleting mesa');
  }
};
