// routes/ventaRoutes.ts
import express from 'express';
import {
  postVenta,
  getConsumoDetalle,
  getResumenVentas,
  getStockResumen,
  getVentasDetalladas
} from '../controllers/ventaController';

const router = express.Router();

// POST /ventas
router.post('/ventas', postVenta);

// GET /ventas/consumo
router.get('/ventas/consumo', getConsumoDetalle);

// GET /ventas/resumen
router.get('/ventas/resumen', getResumenVentas);

// GET /ventas/stock
router.get('/ventas/stock', getStockResumen);


router.get('/ventas/detalladas', getVentasDetalladas);

export default router;
