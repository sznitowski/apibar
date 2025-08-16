// src/controllers/usuarioController.ts
import { Request, Response } from "express";
import { obtenerPorId, actualizarPerfil, actualizarAvatar } from "../models/usuarioModel";

const safeUser = (u: any) => ({
  id: u.id,
  nombre: u.nombre,
  email: u.email,
  avatar: u.avatar ?? null,
  rol: u.rol,
  activo: u.activo,
});

export async function getMe(req: Request, res: Response) {
  const uid = req.usuario?.id;
  if (!uid) return res.status(401).json({ mensaje: "No autorizado" });

  const user = await obtenerPorId(uid);
  if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });
  return res.json(safeUser(user));
}

export async function updateMe(req: Request, res: Response) {
  const uid = req.usuario?.id;
  if (!uid) return res.status(401).json({ mensaje: "No autorizado" });

  const { nombre, avatar } = req.body as { nombre?: string; avatar?: string };
  const actualizado = await actualizarPerfil(uid, {
    nombre: typeof nombre === "string" ? nombre.trim() : undefined,
    avatar: typeof avatar === "string" ? avatar.trim() : undefined,
  });

  if (!actualizado) return res.status(404).json({ mensaje: "Usuario no encontrado" });
  return res.json(safeUser(actualizado));
}

export async function updateMyAvatar(req: Request, res: Response) {
  const uid = req.usuario?.id;
  if (!uid) return res.status(401).json({ mensaje: "No autorizado" });
  if (!req.file) return res.status(400).json({ mensaje: "Falta archivo 'avatar'" });

  const publicUrl = `/uploads/avatars/${req.file.filename}`;
  await actualizarAvatar(uid, publicUrl);

  const user = await obtenerPorId(uid);
  if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  return res.json(safeUser({ ...user, avatar: publicUrl }));
}
