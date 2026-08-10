import { Router } from 'express';
import { container } from '../../infrastructure/container';
import { validate } from '../middlewares/validation.middleware';
import { RegisterSchema, LoginSchema } from '../../application/dto/auth.dto';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();

const { authController } = container;

// Routes
authRouter.post('/register', validate(RegisterSchema), authController.register);
authRouter.post('/login', validate(LoginSchema), authController.login);
authRouter.get('/me', authMiddleware, authController.getMe);
authRouter.put('/profile', authMiddleware, authController.updateProfile);

authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.get('/verify-email', authController.verifyEmail);

export { authRouter };
