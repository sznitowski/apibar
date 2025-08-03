// controllers/ventaController.ts
import { Request, Response } from 'express';
import { registrarVenta } from '../models/ventaModel';

export const postVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_mesa, productos, tipo_pago } = req.body;

    if (!id_mesa || !Array.isArray(productos) || productos.length === 0 || !tipo_pago) {
      res.status(400).json({ error: 'Datos de venta incompletos' });
      return;
    }

    await registrarVenta(id_mesa, productos, tipo_pago);
    res.status(201).json({ message: 'Venta registrada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la venta', details: (error as Error).message });
  }
};
