import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import logger from '../config/logger';

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
    logger.info('Fetched all products');
    console.log('✅ Productos obtenidos correctamente');
    return rows;
  } catch (error) {
    logger.error('Error fetching products', { error });
    console.error('❌ Error fetching products:', error);
    throw new Error('Error fetching products');
  }
};

export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    const [rows] = await pool.query<Product[]>('SELECT * FROM products WHERE id = ?', [id]);
    logger.info(`Producto ID ${id} obtenido`);
    console.log(`✅ Producto ID ${id} obtenido`);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    logger.error(`Error fetching product ID ${id}`, { error });
    console.error(`❌ Error fetching product ID ${id}:`, error);
    throw new Error('Error fetching product');
  }
};

export const createProduct = async (productData: Product): Promise<number> => {
  try {
    const { name, description, price, stock, category } = productData;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)', 
      [name, description, price, stock, category]
    );
    logger.info(`Producto creado: ${name} (ID ${result.insertId})`);
    console.log(`✅ Producto creado: ${name} (ID ${result.insertId})`);
    return result.insertId;
  } catch (error) {
    logger.error('Error creating product', { error });
    console.error('❌ Error creating product:', error);
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
    logger.info(`Producto actualizado ID ${id}`);
    console.log(`✅ Producto actualizado ID ${id}`);
  } catch (error) {
    logger.error(`Error updating product ID ${id}`, { error });
    console.error(`❌ Error updating product ID ${id}:`, error);
    throw new Error('Error updating product');
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    logger.info(`Producto eliminado ID ${id}`);
    console.log(`✅ Producto eliminado ID ${id}`);
  } catch (error) {
    logger.error(`Error deleting product ID ${id}`, { error });
    console.error(`❌ Error deleting product ID ${id}:`, error);
    throw new Error('Error deleting product');
  }
};