// src/models/tokenModel.ts
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { consultar, ejecutar } from '../config/database';

export interface RefreshRow extends RowDataPacket {
  id: number;
  usuario_id: number;
  token_hash: string;
  expiracion: string; // DATETIME
  revocado: number;
}

export async function guardarRefresh(
  usuarioId: number,
  tokenHash: string,
  expiracion: Date,
  ua?: string,
  ip?: string
): Promise<number> {
  const res: ResultSetHeader = await ejecutar(
    `INSERT INTO refresh_tokens (usuario_id, token_hash, expiracion, user_agent, ip)
     VALUES (?,?,?,?,?)`,
    [usuarioId, tokenHash, expiracion, ua || null, ip || null]
  );
  return res.insertId;
}

export async function obtenerPorHash(tokenHash: string): Promise<RefreshRow | null> {
  const rows = await consultar<RefreshRow[]>(
    `SELECT * FROM refresh_tokens WHERE token_hash = ? LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

export async function revocarPorId(id: number): Promise<void> {
  await ejecutar(`UPDATE refresh_tokens SET revocado = 1 WHERE id = ?`, [id]);
}

export async function revocarTodosUsuario(usuarioId: number): Promise<void> {
  await ejecutar(`UPDATE refresh_tokens SET revocado = 1 WHERE usuario_id = ?`, [usuarioId]);
}
