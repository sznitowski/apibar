// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const msg = err?.message || 'Error interno';
  const code = err?.status || 500;
  res.status(code).json({ mensaje: msg });
}
