import express from 'express';
import {
  createEquipment,
  createAccessory,
  getEquipmentWithAccessories,
  deleteEquipment,
  deleteAccessory,
  updateEquipment,
  updateAccessory
} from '../controllers/equipmentController';

const router = express.Router();

// Rota para criar novo equipamento
router.post('/equipamentos', createEquipment);

// Rota para criar novo acessório
router.post('/acessorios', createAccessory);

// Rota para obter equipamentos disponíveis com seus acessórios
router.get('/equipamentos/disponiveis', getEquipmentWithAccessories);

// Rota para excluir equipamento (e seus acessórios relacionados)
router.delete('/equipamentos/:id', deleteEquipment);

// Rota para excluir acessório
router.delete('/acessorios/:id', deleteAccessory);

// Rota para editar equipamento
router.put('/equipamentos/:id', updateEquipment);

// Rota para editar acessório
router.put('/acessorios/:id', updateAccessory);

export default router;
