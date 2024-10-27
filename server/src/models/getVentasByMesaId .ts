// ventasService.ts

import pool from '../config/database'; // Importa el pool de conexión a la base de datos
import { Venta } from './types'; // Importa el tipo de Venta si es necesario

export const getVentasByMesaId = async (mesaId: number): Promise<Venta[]> => {
  try {
    const [rows] = await pool.query<Venta[]>('SELECT * FROM ventas WHERE mesa_id = ?', [mesaId]);
    return rows;
  } catch (error) {
    console.error('Error al obtener las ventas por ID de mesa:', error);
    throw error;
  }
};
