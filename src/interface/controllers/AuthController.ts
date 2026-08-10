import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { GetMeUseCase } from '../../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { VerifyEmailUseCase } from '../../application/use-cases/VerifyEmailUseCase';
import { RegisterDTO, LoginDTO } from '../../application/dto/auth.dto';
import { sendCreated, sendSuccess } from '../helpers/response.helper';

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private getMeUseCase: GetMeUseCase,
    private updateProfileUseCase: UpdateProfileUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private verifyEmailUseCase: VerifyEmailUseCase,
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

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) throw new Error('Email is required');
      await this.forgotPasswordUseCase.execute(email);
      sendSuccess(res, { message: 'If email exists, a reset link has been sent.' });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) throw new Error('Token and newPassword are required');
      await this.resetPasswordUseCase.execute(token, newPassword);
      sendSuccess(res, { message: 'Password has been reset successfully.' });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') throw new Error('Token is required');
      await this.verifyEmailUseCase.execute(token);
      sendSuccess(res, { message: 'Email verified successfully.' });
    } catch (error) {
      next(error);
    }
  };
}
