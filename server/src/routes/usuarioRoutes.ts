// src/routes/usuarioRoutes.ts (opcional CRUD de usuarios)
import { Router } from 'express';
import { autenticarJWT, autorizarRoles } from '../middlewares/auth';
import * as Usuario from '../models/usuarioModel';

const r = Router();

r.get('/', autenticarJWT, autorizarRoles('admin'), async (_req, res) => {
  const lista = await Usuario.listarUsuarios();
  res.json(lista);
});

export default r;
