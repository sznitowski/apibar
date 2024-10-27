import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import logger from '../config/logger'

interface Product extends RowDataPacket {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const [rows] = await pool.query<Product[]>('SELECT * FROM products');
    return rows;
  } catch (error) {
    logger.error('Error fetching products: %O', error);
    throw new Error('Error fetching products');
  }
};

export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    const [rows] = await pool.query<Product[]>('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (error) {
    logger.error('Error fetching product: %O', error);
    throw new Error('Error fetching product');
  }
};

export const createProduct = async (productData: Product): Promise<number> => {
  try {
    const { name, description, price, stock, category } = productData;
    const [result] = await pool.query<any>(
      'INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)', 
      [name, description, price, stock, category]
    );
    return result.insertId;
  } catch (error) {
    logger.error('Error creating product: %O', error);
    throw new Error('Error creating product');
  }
};

export const updateProduct = async (id: number, productData: Product): Promise<void> => {
  try {
    const { name, description, price, stock, category } = productData;
    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?', 
      [name, description, price, stock, category, id]
    );
  } catch (error) {
    logger.error('Error updating product: %O', error);
    throw new Error('Error updating product');
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  } catch (error) {
    logger.error('Error deleting product: %O', error);
    throw new Error('Error deleting product');
  }
};
