// routes/ventaRoutes.ts
import express from 'express';
import { postVenta } from '../controllers/ventaController';

const router = express.Router();

// POST /ventas
router.post('/ventas', postVenta);

export default router;
