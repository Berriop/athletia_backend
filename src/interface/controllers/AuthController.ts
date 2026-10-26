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
import { ValidationError } from '../../domain/errors/AppError';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
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
      await this.forgotPasswordUseCase.execute(req.body.email);
      sendSuccess(res, { message: 'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.' });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      await this.resetPasswordUseCase.execute(token, newPassword);
      sendSuccess(res, { message: 'La contraseña se restableció correctamente.' });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') throw new ValidationError('El token es obligatorio');
      await this.verifyEmailUseCase.execute(token);
      sendSuccess(res, { message: 'Correo verificado correctamente.' });
    } catch (error) {
      next(error);
    }
  };
}
