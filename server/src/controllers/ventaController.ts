// controllers/ventaController.ts
import { Request, Response } from 'express';
import {
  registrarVenta,
  obtenerConsumoDetalle,
  obtenerResumenVentas,
  obtenerStockResumen,
  obtenerVentasDetalladas,
} from '../models/ventaModel';

// POST /ventas
export const postVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_mesa, productos, tipo_pago } = req.body;

    if (!id_mesa || !Array.isArray(productos) || productos.length === 0 || !tipo_pago) {
      res.status(400).json({ error: 'Datos de venta incompletos' });
      return;
    }

    await registrarVenta(Number(id_mesa), productos, String(tipo_pago));
    res.status(201).json({ message: 'Venta registrada con éxito' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Error al registrar la venta',
      details: err.message,
    });
  }
};

// GET /ventas/consumo
export const getConsumoDetalle = async (_req: Request, res: Response): Promise<void> => {
  try {
    const detalle = await obtenerConsumoDetalle();
    res.json(detalle);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Error al obtener detalle de consumo',
      details: err.message,
    });
  }
};

// GET /ventas/resumen
export const getResumenVentas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ventas = await obtenerResumenVentas();
    res.json(ventas);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Error al obtener resumen de ventas',
      details: err.message,
    });
  }
};

// GET /ventas/stock
// Soporta filtros opcionales:
//   /ventas/stock?q=quilmes&category=alcohol
export const getStockResumen = async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await obtenerStockResumen();

    const q = String(req.query.q || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim();

    // Filtro en controller (sin tocar el model)
    const filtrado = rows.filter((r) => {
      const okQ = q ? (r.name || '').toLowerCase().includes(q) : true;
      const okCat = category ? (r.category || '') === category : true;
      return okQ && okCat;
    });

    res.json(filtrado);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Error al obtener resumen de stock',
      details: err.message,
    });
  }
};

export const getVentasDetalladas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, mesa, categoria, pago } = req.query;

    const params = {
      from: typeof from === "string" && from.trim() ? from.trim() : undefined,
      to:   typeof to   === "string" && to.trim()   ? to.trim()   : undefined,
      mesa: typeof mesa === "string" && mesa.trim() ? Number(mesa) : undefined,
      categoria: typeof categoria === "string" && categoria.trim() ? categoria.trim() : undefined,
      pago: typeof pago === "string" && pago.trim() ? pago.trim() : undefined,
    };

    if (params.mesa !== undefined && Number.isNaN(params.mesa)) {
      res.status(400).json({ error: 'Parámetro "mesa" inválido' });
      return;
    }

    const rows = await obtenerVentasDetalladas(params);
    res.json(rows);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: "Error al obtener ventas detalladas",
      details: err.message,
    });
  }
};
