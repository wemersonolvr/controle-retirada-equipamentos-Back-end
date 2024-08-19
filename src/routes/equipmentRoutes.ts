import express from 'express';
import { createEquipment, createAccessory, getAvailableEquipmentWithAccessories } from '../controllers/equipmentController';

const router = express.Router();

router.post('/equipamentos', createEquipment);
router.post('/acessorios', createAccessory);
router.get('/equipamentos/disponiveis', getAvailableEquipmentWithAccessories);

export default router;
