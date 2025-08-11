// src/models/usuarioModel.ts
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { consultar, ejecutar } from '../config/database';

export interface UsuarioConRol extends RowDataPacket {
  id: number;
  nombre: string;
  email: string;           // alias de 'correo'
  password_hash: string;   // alias de 'contrasena_hash'
  rol: 'ADMIN' | 'GERENTE' | 'USUARIO' | string;
  activo: number;
}

export async function obtenerPorEmail(email: string): Promise<UsuarioConRol | null> {
  const rows = await consultar<UsuarioConRol[]>(
    `SELECT id, nombre, correo AS email, contrasena_hash AS password_hash, rol, activo
     FROM usuarios
     WHERE correo = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function obtenerPorId(id: number): Promise<UsuarioConRol | null> {
  const rows = await consultar<UsuarioConRol[]>(
    `SELECT id, nombre, correo AS email, contrasena_hash AS password_hash, rol, activo
     FROM usuarios
     WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function crearUsuario(
  nombre: string,
  email: string,
  passwordHash: string,
  rol: string
): Promise<number> {

  const permitidos = new Set(['ADMIN', 'GERENTE', 'USUARIO']);
  const rolFinal = (rol || 'USUARIO').toUpperCase();
  if (!permitidos.has(rolFinal)) throw new Error('Rol inválido');

  const res: ResultSetHeader = await ejecutar(
    `INSERT INTO usuarios (nombre, correo, contrasena_hash, rol)
     VALUES (?,?,?,?)`,
    [nombre, email, passwordHash, rolFinal]
  );
  return res.insertId;
}

export async function listarUsuarios(): Promise<UsuarioConRol[]> {
  return consultar<UsuarioConRol[]>(
    `SELECT id, nombre, correo AS email, contrasena_hash AS password_hash,
            rol, activo, creado_en, actualizado_en
     FROM usuarios
     ORDER BY id DESC`
  );
}

export async function actualizarPassword(id: number, nuevoHash: string): Promise<void> {
  await ejecutar(`UPDATE usuarios SET contrasena_hash = ? WHERE id = ?`, [nuevoHash, id]);
}


