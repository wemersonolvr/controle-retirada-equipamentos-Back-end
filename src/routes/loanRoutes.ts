import express from 'express';
import { createLoan, getLoans, returnEquipment } from '../controllers/loanController';

const router = express.Router();

router.post('/emprestimos', createLoan);
router.get('/emprestimos', getLoans);
router.put('/emprestimos/:id/devolver', returnEquipment);

export default router;
