  import { Request, Response } from 'express';

  import * as productModel from '../models/productModel';

  export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await productModel.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  };

  export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await productModel.getProductById(Number(id));
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching product' });
    }
  };

  export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const productData = req.body;
      const productId = await productModel.createProduct(productData);
      res.json({ id: productId, ...productData });
    } catch (error) {
      res.status(500).json({ error: 'Error creating product' });
    }
  };

  export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const productData = req.body;
      await productModel.updateProduct(Number(id), productData);
      res.json({ id, ...productData });
    } catch (error) {
      res.status(500).json({ error: 'Error updating product' });
    }
  };

  export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await productModel.deleteProduct(Number(id));
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting product' });
    }
  };
