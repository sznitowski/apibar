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

// Controlador
export const createMesa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { capacidad, ubicacion } = req.body;

    // Validación de los campos requeridos
    if (!capacidad || !ubicacion) {
      res.status(400).json({ error: 'Missing required fields: capacidad, ubicacion' });
    }

    const mesaId = await mesaModel.createMesa(capacidad, ubicacion);
    res.json({ id: mesaId, capacidad, ubicacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating mesa' });
  }
};



export const updateMesa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { capacidad, ubicacion } = req.body;

    if (!capacidad || !ubicacion) {
      res.status(400).json({ error: 'Missing required fields: capacidad, ubicacion' });
      return;
    }


    await mesaModel.updateMesa(Number(id), capacidad, ubicacion);
    res.json({ id, capacidad, ubicacion });
  } catch (error) {
    console.error(error);
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

export const getMesasConsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const mesas = await mesaModel.getMesasConsumo();
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mesas' });
  }
};


// CONSUMO -----------------------------------------------------------------------------
export const getConsumosByMesa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_mesa } = req.params;
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      res.status(400).json({ error: "productIds debe ser un array" });
      return; // 👈 esto evita que se ejecute lo de abajo si hay error
    }

    await mesaModel.setConsumoForMesa(Number(id_mesa), productIds);
    res.json({ message: "Consumo actualizado" });
  } catch (error) {
    console.error(`Error updating consumo: ${error}`);
    res.status(500).json({ error: "Error actualizando consumo" });
  }
};


// Obtener todos los productos disponibles
export const getAllProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await mesaModel.getAllProductos();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching productos' });
  }
};

// Crear un nuevo consumo
export const createConsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_mesa, id_producto, cantidad } = req.body;

    if (!id_mesa || !id_producto || !cantidad) {
      res.status(400).json({ error: 'Missing required fields: id_mesa, id_producto, cantidad' });
      return;
    }

    const consumoId = await mesaModel.createConsumo(id_mesa, id_producto, cantidad);
    res.status(201).json({ id: consumoId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating consumo' });
  }
};