// src/middlewares/validacion.ts (agregar)
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validar = (rules: any[]) => [
  ...rules,
  (req: Request, res: Response, next: NextFunction) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errores: errs.array() });
    next();
  },
];

export const vLogin = validar([
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isString().isLength({ min: 6 }),
]);

export const vRegistrar = validar([
  body('nombre').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('rol').isIn(['ADMIN','GERENTE','USUARIO']),
]);

export const vCambiarPass = validar([
  body('actual').isString().isLength({ min: 6 }),
  body('nueva').isString().isLength({ min: 8 }),
]);

export const vForgot = validar([
  body('email').isEmail(),
]);

export const vReset = validar([
  body('token').isString().isLength({ min: 16 }),
  body('nueva').isString().isLength({ min: 8 }),
]);
