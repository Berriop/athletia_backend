import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// Protected by both authMiddleware and adminMiddleware
router.get('/dashboard', authMiddleware, adminMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the admin dashboard',
    data: {
      stats: 'Sensitive admin stats would go here'
    }
  });
});

export const adminRouter = router;
