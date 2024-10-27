import { Request, Response } from 'express';
import * as mesaModel from '../models/mesaModel';

export const getAllMesas = async (req: Request, res: Response): Promise<void> => {
  try {
    const mesas = await mesaModel.getAllMesas();
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mesas' });
  }
};

export const getMesaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const mesa = await mesaModel.getMesaById(Number(id));
    if (mesa) {
      res.json(mesa);
    } else {
      res.status(404).json({ message: 'Mesa not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mesa' });
  }
};

export const createMesa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productMesa } = req.body;
    const mesaId = await mesaModel.createMesa(productMesa);
    res.json({ id: mesaId, ...productMesa });
  } catch (error) {
    res.status(500).json({ error: 'Error creating mesa' });
  }
};

export const updateMesa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, estado } = req.body;
    await mesaModel.updateMesa(Number(id), nombre, estado);
    res.json({ id, nombre, estado });
  } catch (error) {
    res.status(500).json({ error: 'Error updating mesa' });
  }
};

export const deleteMesa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await mesaModel.deleteMesa(Number(id));
    res.json({ message: 'Mesa deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting mesa' });
  }
};
