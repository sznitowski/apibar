// src/types/express.d.ts
import "express";

declare global {
  namespace Express {
    interface UsuarioToken {
      id: number;
      rol: string;
    }

    // Lo que agrega tu middleware de auth:
    interface Request {
      usuario?: UsuarioToken;
      // Lo que agrega Multer:
      file?: Express.Multer.File;
      files?: Record<string, Express.Multer.File[]> | Express.Multer.File[];
    }
  }
}

export {};
