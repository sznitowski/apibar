// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UsuarioToken {
    id: number;
    rol: string;
}

declare global {
    namespace Express {
        interface Request {
            usuario?: UsuarioToken;
        }
    }
}

export function autenticarJWT(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ mensaje: 'Token faltante' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as UsuarioToken;
        req.usuario = { id: payload.id, rol: payload.rol };
        next();
    } catch {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
}

// src/middlewares/auth.ts
export function autorizarRoles(...rolesPermitidos: string[]) {
    return (req: any, res: any, next: Function) => {
        const rol = req.usuario?.rol; // viene del token (u.rol)
        if (!rol) return res.status(401).json({ mensaje: 'No autenticado' });
        if (!rolesPermitidos.includes(String(rol).toUpperCase())) {
            return res.status(403).json({ mensaje: 'Sin permisos' });
        }
        next();
    };
}

