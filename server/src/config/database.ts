import { createPool } from 'mysql2/promise'; 
import logger from './logger';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuración de la conexión a la base de datos
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Manejo de errores de conexión a la base de datos
pool.getConnection()
  .then(connection => {
    connection.release();
    console.log(`DB_USER: ${process.env.DB_USER}`);  // Should output your username
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD}`);  // Should output your password

    logger.info('Connected to MySQL database');
  })
  .catch(error => {
    logger.error(`Error connecting to MySQL database: ${error}`);
    process.exit(1);
  });

export default pool;
