import { Router } from 'express';
import { getAllMesas, getMesaById, createMesa, updateMesa, deleteMesa } from '../controllers/mesaController';

const router = Router();


router.get('/mesas', getAllMesas);
router.get('/mesas/:id', getMesaById);
//router.post('/mesas', createMesa);
router.put('/mesas/:id', updateMesa);
router.delete('/mesas/:id', deleteMesa);

export default router;
