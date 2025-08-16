// src/routes/authRoutes.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login, registrar, perfil, refresh, logout, logoutTodos, cambiarPassword,
  forgotPassword, resetPassword
} from '../controllers/authController';
import { updateMyAvatar } from "../controllers/usuarioController";
import { autenticarJWT, autorizarRoles  } from '../middlewares/auth';
import { vLogin, vRegistrar, vCambiarPass, vForgot, vReset } from '../middlewares/validacion';
import { upload } from "../middlewares/upload"; // <-- ahora sí

const r = Router();

const limitLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos, probá más tarde.' },
});

const limitForgot = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiadas solicitudes, probá más tarde.' },
});

// Auth
r.post('/login', limitLogin, vLogin, login);
r.post('/refresh', refresh);
r.post('/logout', logout);
r.post('/logout-todos', autenticarJWT, logoutTodos);

// Forgot / Reset
r.post('/forgot-password', limitForgot, vForgot, forgotPassword);
r.post('/reset-password', vReset, resetPassword);

// Usuarios
r.post('/registrar', autenticarJWT, autorizarRoles('ADMIN'), vRegistrar, registrar);
r.get('/perfil', autenticarJWT, perfil);
r.post('/cambiar-password', autenticarJWT, vCambiarPass, cambiarPassword);
r.put("/me/avatar", autenticarJWT, upload.single("avatar"), updateMyAvatar);

export default r;
