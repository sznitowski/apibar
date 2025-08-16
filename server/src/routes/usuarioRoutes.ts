// src/routes/usuarioRoutes.ts
import { Router } from "express";
import { autenticarJWT, autorizarRoles } from "../middlewares/auth";
import * as Usuario from "../models/usuarioModel";

const r = Router();

// --- existente: listado admin ---
r.get("/", autenticarJWT, autorizarRoles("admin"), async (_req, res) => {
  const lista = await Usuario.listarUsuarios();
  res.json(lista);
});

// --- NUEVO: perfil propio ---
r.get("/me", autenticarJWT, async (req, res) => {
  const uid = req.usuario?.id;               // <-- tu middleware setea req.usuario
  if (!uid) return res.status(401).json({ mensaje: "No autorizado" });

  const user = await Usuario.obtenerPorId(uid);
  if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  res.json(safeUser(user));
});

r.put("/me", autenticarJWT, async (req, res) => {
  const uid = req.usuario?.id;
  if (!uid) return res.status(401).json({ mensaje: "No autorizado" });

  const { nombre, avatar } = req.body as { nombre?: string; avatar?: string };
  const actualizado = await Usuario.actualizarPerfil(uid, {
    nombre: typeof nombre === "string" ? nombre.trim() : undefined,
    avatar: typeof avatar === "string" ? avatar.trim() : undefined,
  });

  if (!actualizado) return res.status(404).json({ mensaje: "Usuario no encontrado" });
  res.json(safeUser(actualizado));
});

export default r;

// no expongas hash ni campos internos
function safeUser(u: any) {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    avatar: u.avatar ?? null,
    rol: u.rol,
    activo: u.activo,
  };
}
