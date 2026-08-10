import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { container } from '../../infrastructure/container';

const router = Router();
const { adminController } = container;

router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.getUsers);
router.patch('/users/:userId/toggle-block', adminController.toggleBlock);
router.post('/users/:userId/toggle-block', adminController.toggleBlock);

export const adminRouter = router;
