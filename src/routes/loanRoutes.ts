import express from 'express';
import { createLoan, getLoans, updateLoanStatus } from '../controllers/loanController';

const router = express.Router();

router.post('/emprestimos', createLoan);
router.get('/emprestimos', getLoans);
router.put('/emprestimos/:id', updateLoanStatus);

export default router;
