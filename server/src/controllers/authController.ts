// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Usuario from '../models/usuarioModel';
import * as Tokens from '../models/tokenModel';
import * as PR from '../models/passwordResetModel';
import * as RT from '../models/tokenModel';
import { generarAccessToken, generarRefreshTokenRaw, hashRefreshToken } from '../utils/tokens';



const ACCESS_EXP = process.env.JWT_EXPIRES_IN || '15m';         // token corto
const REFRESH_DIAS = Number(process.env.REFRESH_DAYS || 30);    // p.ej. 30 días

const RESET_MINUTOS = Number(process.env.RESET_MINUTES || 30);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; 

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: REFRESH_DIAS * 24 * 60 * 60 * 1000,
};


export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ mensaje: 'Email y password son obligatorios' });

  const u = await Usuario.obtenerPorEmail(email);
  if (!u || !u.activo) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

  const accessToken = generarAccessToken({ id: u.id, rol: u.rol }, ACCESS_EXP);

  // refresh token
  const rtRaw = generarRefreshTokenRaw();
  const rtHash = hashRefreshToken(rtRaw);
  const expDate = new Date(Date.now() + cookieOpts.maxAge);
  await Tokens.guardarRefresh(u.id, rtHash, expDate, req.headers['user-agent'] as string, req.ip);

  // Seteamos el refresh en cookie HttpOnly
  res.cookie('rt', rtRaw, cookieOpts);

  return res.json({
    token: accessToken,
    usuario: { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }
  });
}

export async function refresh(req: Request, res: Response) {
  const rtRaw = (req.cookies && req.cookies.rt) as string | undefined;
  if (!rtRaw) return res.status(401).json({ mensaje: 'Refresh token faltante' });

  const rtHash = hashRefreshToken(rtRaw);
  const row = await Tokens.obtenerPorHash(rtHash);
  if (!row || row.revocado) return res.status(401).json({ mensaje: 'Refresh inválido' });

  if (new Date(row.expiracion).getTime() < Date.now()) {
    await Tokens.revocarPorId(row.id);
    return res.status(401).json({ mensaje: 'Refresh expirado' });
  }

  // buscá usuario
  const u = await Usuario.obtenerPorId(row.usuario_id);
  if (!u || !u.activo) {
    await Tokens.revocarPorId(row.id);
    return res.status(401).json({ mensaje: 'Usuario inválido' });
  }

  // Rotación: revoco el viejo y emito uno nuevo
  await Tokens.revocarPorId(row.id);

  const nuevoAccess = generarAccessToken({ id: u.id, rol: u.rol }, ACCESS_EXP);
  const nuevoRtRaw = generarRefreshTokenRaw();
  const nuevoRtHash = hashRefreshToken(nuevoRtRaw);
  const expDate = new Date(Date.now() + cookieOpts.maxAge);
  await Tokens.guardarRefresh(u.id, nuevoRtHash, expDate, req.headers['user-agent'] as string, req.ip);

  res.cookie('rt', nuevoRtRaw, cookieOpts);
  return res.json({ token: nuevoAccess });
}

export async function logout(req: Request, res: Response) {
  const rtRaw = (req.cookies && req.cookies.rt) as string | undefined;
  if (rtRaw) {
    const rtHash = hashRefreshToken(rtRaw);
    const row = await Tokens.obtenerPorHash(rtHash);
    if (row) await Tokens.revocarPorId(row.id);
  }
  res.clearCookie('rt', { path: '/api/auth' });
  return res.json({ mensaje: 'Sesión cerrada' });
}

export async function logoutTodos(req: Request, res: Response) {
  const userId = req.usuario!.id;
  await Tokens.revocarTodosUsuario(userId);
  res.clearCookie('rt', { path: '/api/auth' });
  return res.json({ mensaje: 'Sesiones revocadas' });
}

export async function registrar(req: Request, res: Response) {
  const { nombre, email, password, rol } = req.body || {};
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ mensaje: 'Faltan campos: nombre, email, password, rol' });
  }

  const existe = await Usuario.obtenerPorEmail(email);
  if (existe) return res.status(409).json({ mensaje: 'El email ya está registrado' });

  const hash = await bcrypt.hash(password, 10);
  const id = await Usuario.crearUsuario(nombre, email, hash, rol.toUpperCase());
  const nuevo = await Usuario.obtenerPorId(id);
  return res.status(201).json({
    usuario: { id: nuevo!.id, nombre: nuevo!.nombre, email: nuevo!.email, rol: nuevo!.rol }
  });
}

export async function perfil(req: Request, res: Response) {
  const id = req.usuario!.id;
  const u = await Usuario.obtenerPorId(id);
  if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  return res.json({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });
}

export async function cambiarPassword(req: Request, res: Response) {
  const id = req.usuario!.id;
  const { actual, nueva } = req.body || {};
  if (!actual || !nueva) return res.status(400).json({ mensaje: 'Faltan campos: actual y nueva' });

  const u = await Usuario.obtenerPorId(id);
  if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

  const ok = await bcrypt.compare(actual, u.password_hash);
  if (!ok) return res.status(401).json({ mensaje: 'Password actual incorrecta' });

  const nuevoHash = await bcrypt.hash(nueva, 10);
  await Usuario.actualizarPassword(id, nuevoHash);
  await Tokens.revocarTodosUsuario(id); // cierra sesiones
  res.clearCookie('rt', { path: '/api/auth' });

  return res.json({ mensaje: 'Password actualizada. Vuelve a iniciar sesión.' });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body || {};
  // Siempre responder 200 para no filtrar existencia de usuarios
  const u = email ? await Usuario.obtenerPorEmail(email) : null;
  if (u) {
    const raw = generarRefreshTokenRaw();
    const hash = hashRefreshToken(raw);
    const exp = new Date(Date.now() + RESET_MINUTOS * 60 * 1000);
    await PR.guardar(u.id, hash, exp, req.headers['user-agent'] as string, req.ip);

    // “Enviar” email: en dev devolvemos la URL para que puedas probar rápido.
    const url = `${FRONTEND_URL}/reset-password?token=${raw}`;
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ mensaje: 'Si el email existe, se envió un enlace.', reset_url: url, expira_min: RESET_MINUTOS });
    }
    // En prod: integrá tu mailer y enviá `url` por email.
  }
  return res.json({ mensaje: 'Si el email existe, se envió un enlace.' });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, nueva } = req.body || {};
  if (!token || !nueva) return res.status(400).json({ mensaje: 'Token y nueva son obligatorios' });

  const hash = hashRefreshToken(token);
  const row = await PR.obtenerPorHash(hash);
  if (!row || row.usado_en) return res.status(400).json({ mensaje: 'Token inválido' });
  if (new Date(row.expiracion).getTime() < Date.now()) return res.status(400).json({ mensaje: 'Token expirado' });

  const u = await Usuario.obtenerPorId(row.usuario_id);
  if (!u || !u.activo) return res.status(400).json({ mensaje: 'Usuario inválido' });

  const nuevoHash = await bcrypt.hash(nueva, 10);
  await Usuario.actualizarPassword(u.id, nuevoHash);
  await PR.marcarUsado(row.id);
  await RT.revocarTodosUsuario(u.id);            // revoco refresh tokens
  res.clearCookie('rt', { path: '/api/auth' });  // borro cookie de refresh

  return res.json({ mensaje: 'Contraseña actualizada. Iniciá sesión de nuevo.' });
}


