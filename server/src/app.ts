// src/app.ts (o server.ts)
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './config/logger';
import { errorHandler } from './middlewares/errorHandler';

import productRoutes from './routes/productRoutes';
import mesaRoutes from './routes/mesaRoutes';
import ventaRoutes from './routes/ventaRoutes';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import path from 'path';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// CORS: si vas a pegar desde CRA en 3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// RUTAS
app.use('/api', productRoutes);
app.use('/api', mesaRoutes);
app.use('/api', ventaRoutes);
app.use('/api/auth', authRoutes);       // → /api/auth/login
app.use('/api/usuarios', usuarioRoutes);


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// health-check (para probar rápido)
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// 404 simple
app.use((_req, res) => res.status(404).json({ mensaje: 'No encontrado' }));

// Manejador de errores SIEMPRE al final
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => logger.info(`Servidor escuchando en puerto ${PORT}`));
