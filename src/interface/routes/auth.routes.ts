import { Router } from 'express';
import { container } from '../../infrastructure/container';
import { validate } from '../middlewares/validation.middleware';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} from '../../application/dto/auth.dto';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();

const { authController } = container;

// Routes
authRouter.post('/register', validate(RegisterSchema), authController.register);
authRouter.post('/login', validate(LoginSchema), authController.login);
authRouter.get('/me', authMiddleware, authController.getMe);
authRouter.put('/profile', authMiddleware, validate(UpdateProfileSchema), authController.updateProfile);

authRouter.post('/forgot-password', validate(ForgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', validate(ResetPasswordSchema), authController.resetPassword);
authRouter.get('/verify-email', authController.verifyEmail);

export { authRouter };
