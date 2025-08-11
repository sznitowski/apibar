// src/models/passwordResetModel.ts
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { consultar, ejecutar } from '../config/database';

export interface PasswordResetRow extends RowDataPacket {
  id: number;
  usuario_id: number;
  token_hash: string;
  expiracion: string; // DATETIME
  usado_en: string | null;
}

export async function guardar(
  usuarioId: number,
  tokenHash: string,
  expiracion: Date,
  ua?: string,
  ip?: string
): Promise<number> {
  const res: ResultSetHeader = await ejecutar(
    `INSERT INTO password_resets (usuario_id, token_hash, expiracion, user_agent, ip)
     VALUES (?,?,?,?,?)`,
    [usuarioId, tokenHash, expiracion, ua || null, ip || null]
  );
  return res.insertId;
}

export async function obtenerPorHash(tokenHash: string): Promise<PasswordResetRow | null> {
  const rows = await consultar<PasswordResetRow[]>(
    `SELECT * FROM password_resets WHERE token_hash = ? LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

export async function marcarUsado(id: number): Promise<void> {
  await ejecutar(`UPDATE password_resets SET usado_en = NOW() WHERE id = ?`, [id]);
}
