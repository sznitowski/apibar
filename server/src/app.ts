import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import logger from './config/logger';
import { errorHandler } from './middlewares/errorHandler';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/productRoutes';
import mesaRoutes from './routes/mesaRoutes';
import ventaRoutes from './routes/ventaRoutes';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';

dotenv.config();

const app = express();
app.set('trust proxy', 1); 
app.use(express.json());
app.use(cookieParser());


app.use(cors()); 
app.use(express.json());
app.use(errorHandler);

app.use('/api/', productRoutes);
app.use('/api/', mesaRoutes);
app.use('/api/', ventaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);



  const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => logger.info(`Servidor escuchando en puerto ${PORT}`));

