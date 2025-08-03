import winston from 'winston';
import TransportStream from 'winston-transport'; // Clase base para transportes personalizados
import { createConnection, Connection } from 'mysql2/promise';

// Configuración de conexión a la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'apibar', // Nombre de la base de datos
};

// Crear una conexión a la base de datos
let dbConnection: Connection | null = null;

const connectToDatabase = async () => {
  if (!dbConnection) {
    dbConnection = await createConnection(dbConfig);
  }
  return dbConnection;
};

// Función para formatear fechas al formato compatible con MySQL
const formatTimestampForMySQL = (isoDate: string): string => {
  const date = new Date(isoDate);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// Transporte personalizado para insertar logs en la base de datos
class DatabaseTransport extends TransportStream {
  async log(info: any, callback: () => void) {
    const { level, message, timestamp, ...meta } = info;
    const connection = await connectToDatabase();

    try {
      const formattedTimestamp = formatTimestampForMySQL(timestamp || new Date().toISOString());
      await connection.execute(
        `INSERT INTO logs (level, message, timestamp, meta) VALUES (?, ?, ?, ?)`,
        [level, message, formattedTimestamp, JSON.stringify(meta)]
      );
      console.info(`Log inserted into database: ${message}`);
    } catch (err) {
      console.error('Error inserting log into database:', err);
    }
    callback();
  }
}

// Configuración del logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new DatabaseTransport(), // Agrega el transporte personalizado
  ],
});

// Ejemplo de uso del logger
logger.info('Información registrada correctamente');
logger.error('Este es un mensaje de error con más detalles', { detalle: 'Algo falló' });

export default logger;
