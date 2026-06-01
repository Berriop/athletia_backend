"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const RegisterUseCase_1 = require("../../application/use-cases/RegisterUseCase");
const LoginUseCase_1 = require("../../application/use-cases/LoginUseCase");
const GetMeUseCase_1 = require("../../application/use-cases/GetMeUseCase");
const PrismaUserRepository_1 = require("../../infrastructure/repositories/PrismaUserRepository");
const BcryptService_1 = require("../../infrastructure/security/BcryptService");
const JwtService_1 = require("../../infrastructure/security/JwtService");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_dto_1 = require("../../application/dto/auth.dto");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
// Dependency Injection Setup
const userRepository = new PrismaUserRepository_1.PrismaUserRepository();
const bcryptService = new BcryptService_1.BcryptService();
const jwtService = new JwtService_1.JwtService();
const registerUseCase = new RegisterUseCase_1.RegisterUseCase(userRepository, bcryptService, jwtService);
const loginUseCase = new LoginUseCase_1.LoginUseCase(userRepository, bcryptService, jwtService);
const getMeUseCase = new GetMeUseCase_1.GetMeUseCase(userRepository);
const authController = new AuthController_1.AuthController(registerUseCase, loginUseCase, getMeUseCase);
// Routes
authRouter.post('/register', (0, validation_middleware_1.validate)(auth_dto_1.RegisterSchema), authController.register);
authRouter.post('/login', (0, validation_middleware_1.validate)(auth_dto_1.LoginSchema), authController.login);
authRouter.get('/me', auth_middleware_1.authMiddleware, authController.getMe);
