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

// helper para normalizar listas desde query (?a=x,y,z o ?a=x&a=y)
const toArray = (v: unknown): string[] | undefined => {
  if (v === undefined || v === null) return undefined;
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  const s = String(v).trim();
  if (!s) return undefined;
  return s.includes(',') ? s.split(',').map(t => t.trim()).filter(Boolean) : [s];
};

//   - meta=products&q= -> sugerencias de productos (id, name, category)
//   - sin meta         -> resumen de stock con filtros (si lo querés usar también acá)
export const getStockResumen = async (req: Request, res: Response) => {
  try {
    const { meta, q, limit } = req.query;

    const categorias = toArray(req.query.categorias ?? req.query.category);
    const idsStr = toArray(req.query.ids);
    const ids = idsStr?.map(n => Number(n)).filter(n => !Number.isNaN(n));

    const data = await obtenerStockResumen({
      meta: typeof meta === 'string' ? (meta as 'categories' | 'products') : undefined,
      q: typeof q === 'string' ? q : undefined,
      limit: limit ? Number(limit) : undefined,
      categorias,
      ids,
    });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener stock', details: (e as Error).message });
  }
};

export const getVentasDetalladas = async (req: Request, res: Response) => {
  try {
    const { from, to, pago, q } = req.query;

    const categorias = toArray(req.query.categorias ?? req.query.categoria);
    const productosStr = toArray(req.query.productos ?? req.query.producto);
    const productos = productosStr?.map(n => Number(n)).filter(n => !Number.isNaN(n));

    const rows = await obtenerVentasDetalladas({
      from: typeof from === 'string' && from.trim() ? from.trim() : undefined,
      to:   typeof to   === 'string' && to.trim()   ? to.trim()   : undefined,
      pago: typeof pago === 'string' && pago.trim() ? pago.trim() : undefined,
      categorias,
      productos,
      q: typeof q === 'string' && q.trim() ? q.trim() : undefined,
    });

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener ventas detalladas', details: (e as Error).message });
  }
};
