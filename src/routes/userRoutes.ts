import express from 'express';
import { createAdmin, loginAdmin } from '../controllers/userController';

const router = express.Router();

router.post('/admin/register', createAdmin);
router.post('/admin/login', loginAdmin);

export default router;
