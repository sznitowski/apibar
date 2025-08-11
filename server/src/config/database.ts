// src/config/database.ts
import { createPool, type Pool, type PoolConnection, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();

const pool: Pool = createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  queueLimit: 0,
  dateStrings: true,
  timezone: 'Z',
  multipleStatements: false,
});

(async () => {
  try {
    const c = await pool.getConnection();
    await c.ping();
    c.release();
    logger.info('MySQL conectado.');
  } catch (err) {
    logger.error('Error de conexión MySQL.');
    process.exit(1);
  }
})();

// SELECT: devolvé filas tipadas
export async function consultar<T extends RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

// DML (INSERT/UPDATE/DELETE): devolvé metadatos
export async function ejecutar(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  const [res] = await pool.execute<ResultSetHeader>(sql, params);
  return res;
}

// Transacciones
export async function transaccion<R>(fn: (cn: PoolConnection) => Promise<R>): Promise<R> {
  const cn = await pool.getConnection();
  try {
    await cn.beginTransaction();
    const out = await fn(cn);
    await cn.commit();
    return out;
  } catch (e) {
    await cn.rollback();
    throw e;
  } finally {
    cn.release();
  }
}

export async function cerrarPool(): Promise<void> { await pool.end(); }
export default pool;
