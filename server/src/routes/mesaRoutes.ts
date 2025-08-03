import { Router } from 'express';
import { getAllMesas, getMesaById, createMesa, updateMesa, deleteMesa, getMesasConsumo, getConsumosByMesa, getAllProductos, createConsumo  } from '../controllers/mesaController';

const router = Router();


router.get('/mesas', getAllMesas);
router.get('/consumo', getMesasConsumo);
router.get('/mesas/:id', getMesaById);
router.post('/mesas', createMesa);
router.put('/mesas/:id', updateMesa);
router.delete('/mesas/:id', deleteMesa);
router.get('/consumos/:id_mesa', getConsumosByMesa);
router.get('/productos', getAllProductos);
router.post('/consumos', createConsumo);

export default router;
