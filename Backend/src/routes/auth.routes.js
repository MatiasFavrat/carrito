import { Router } from 'express';
import { loginClient, loginEmployee, verifyToken } from '../controllers/auth.controllers.js';

const router = Router();

router.post('/login', loginClient);
router.post('/employee/login', loginEmployee);
router.get('/verify-token', verifyToken);

export default router;