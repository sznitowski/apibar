import { Request, Response } from 'express';

import * as productModel from '../models/productModel';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json(products);
    console.log('Status: 200, Response: Products fetched successfully');
  } catch (error) {
    console.error('Status: 500, Error: Error fetching products', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(Number(id));
    if (product) {
      res.status(200).json(product);
      console.log(`Status: 200, Response: Product with ID ${id} fetched successfully`);
    } else {
      res.status(404).json({ message: 'Product not found' });
      console.warn(`Status: 404, Response: Product with ID ${id} not found`);
    }
  } catch (error) {
    console.error(`Status: 500, Error: Error fetching product with ID ${req.params.id}`, error);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = req.body;
    const productId = await productModel.createProduct(productData);
    res.status(201).json({ id: productId, ...productData });
    console.log(`Status: 201, Response: Product created with ID ${productId}`);
  } catch (error) {
    console.error('Status: 500, Error: Error creating product', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productData = req.body;
    await productModel.updateProduct(Number(id), productData);
    res.status(200).json({ id, ...productData });
    console.log(`Status: 200, Response: Product with ID ${id} updated successfully`);
  } catch (error) {
    console.error(`Status: 500, Error: Error updating product with ID ${req.params.id}`, error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await productModel.deleteProduct(Number(id));
    res.status(200).json({ message: 'Product deleted' });
    console.log(`Status: 200, Response: Product with ID ${id} deleted successfully`);
  } catch (error) {
    console.error(`Status: 500, Error: Error deleting product with ID ${req.params.id}`, error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};
