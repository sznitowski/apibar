import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Importa el middleware de CORS
import productRoutes from './routes/productRoutes';
import mesaRoutes from './routes/mesaRoutes';
import ventaRoutes from './routes/ventaRoutes';

dotenv.config();

const app = express();

app.use(cors()); // Usa el middleware de CORS
app.use(express.json());

app.use('/api/', productRoutes);
app.use('/api/', mesaRoutes);
app.use('/api/', ventaRoutes);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
