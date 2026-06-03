import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { GetMeUseCase } from '../../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { BcryptService } from '../../infrastructure/security/BcryptService';
import { JwtService } from '../../infrastructure/security/JwtService';
import { validate } from '../middlewares/validation.middleware';
import { RegisterSchema, LoginSchema } from '../../application/dto/auth.dto';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();

// Dependency Injection Setup
const userRepository = new PrismaUserRepository();
const bcryptService = new BcryptService();
const jwtService = new JwtService();

const registerUseCase = new RegisterUseCase(userRepository, bcryptService, jwtService);
const loginUseCase = new LoginUseCase(userRepository, bcryptService, jwtService);
const getMeUseCase = new GetMeUseCase(userRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

const authController = new AuthController(registerUseCase, loginUseCase, getMeUseCase, updateProfileUseCase);

// Routes
authRouter.post('/register', validate(RegisterSchema), authController.register);
authRouter.post('/login', validate(LoginSchema), authController.login);
authRouter.get('/me', authMiddleware, authController.getMe);
authRouter.put('/profile', authMiddleware, authController.updateProfile);

export { authRouter };

