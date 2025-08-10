import winston from 'winston';
import TransportStream from 'winston-transport';
import { createConnection, Connection } from 'mysql2/promise';

// Configuración de conexión a la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'apibar',
};

let dbConnection: Connection | null = null;

const connectToDatabase = async (): Promise<Connection> => {
  if (!dbConnection) {
    try {
      dbConnection = await createConnection(dbConfig);
      console.log('✅ Conectado a la base de datos para logging');
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos de logs:', (error as Error).message);
      throw error;
    }
  }
  return dbConnection;
};

const formatTimestampForMySQL = (isoDate: string): string => {
  const date = new Date(isoDate);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

class DatabaseTransport extends TransportStream {
  async log(info: any, callback: () => void) {
    const { level, message, timestamp, ...meta } = info;

    try {
      const connection = await connectToDatabase();
      const formattedTimestamp = formatTimestampForMySQL(timestamp || new Date().toISOString());

      const safeMeta = (() => {
        try {
          return JSON.stringify(meta);
        } catch {
          return '{}';
        }
      })();

      await connection.execute(
        `INSERT INTO logs (level, message, timestamp, meta) VALUES (?, ?, ?, ?)`,
        [level, message, formattedTimestamp, safeMeta]
      );

      console.info(`📥 Log guardado en base de datos: ${message}`);
    } catch (err) {
      console.error('❌ Error al insertar el log en base de datos:', (err as Error).message);
    }

    callback();
  }
}

// Crear el logger con consola, archivo y base de datos
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // timestamp, level, message, y cualquier metadata adicional
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new DatabaseTransport(),
  ],
});

// Exportación
export default logger;
