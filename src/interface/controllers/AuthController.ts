import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { GetMeUseCase } from '../../application/use-cases/GetMeUseCase';
import { RegisterDTO, LoginDTO } from '../../application/dto/auth.dto';

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private getMeUseCase: GetMeUseCase
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RegisterDTO;
      const result = await this.registerUseCase.execute(data);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as LoginDTO;
      const result = await this.loginUseCase.execute(data);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is guaranteed to be set by the authMiddleware
      const userId = req.user!.id;
      const result = await this.getMeUseCase.execute(userId);
      
      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: result.user,
      });
    } catch (error) {
      next(error);
    }
  };
}
