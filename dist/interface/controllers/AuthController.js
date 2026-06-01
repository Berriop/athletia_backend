"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(registerUseCase, loginUseCase, getMeUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.getMeUseCase = getMeUseCase;
        this.register = async (req, res, next) => {
            try {
                const data = req.body;
                const result = await this.registerUseCase.execute(data);
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const data = req.body;
                const result = await this.loginUseCase.execute(data);
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMe = async (req, res, next) => {
            try {
                // req.user is guaranteed to be set by the authMiddleware
                const userId = req.user.id;
                const result = await this.getMeUseCase.execute(userId);
                res.status(200).json({
                    success: true,
                    message: 'User profile retrieved successfully',
                    data: result.user,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
