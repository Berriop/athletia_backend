import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { GetMeUseCase } from '../../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase';
import { RegisterDTO, LoginDTO } from '../../application/dto/auth.dto';
import { sendCreated, sendSuccess } from '../helpers/response.helper';

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private getMeUseCase: GetMeUseCase,
    private updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RegisterDTO;
      const result = await this.registerUseCase.execute(data);
      sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as LoginDTO;
      const result = await this.loginUseCase.execute(data);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.getMeUseCase.execute(userId);
      sendSuccess(res, result.user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.updateProfileUseCase.execute(userId, req.body);
      sendSuccess(res, result.user);
    } catch (error) {
      next(error);
    }
  };
}
