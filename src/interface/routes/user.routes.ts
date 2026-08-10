import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { container } from '../../infrastructure/container';

const router = Router();
const { userController } = container;

router.get('/export', authMiddleware, userController.exportData);

export const userRouter = router;
