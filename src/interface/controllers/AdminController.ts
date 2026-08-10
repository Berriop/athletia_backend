import { Request, Response, NextFunction } from 'express';
import { GetAllUsersUseCase } from '../../application/use-cases/admin/GetAllUsersUseCase';
import { ToggleUserBlockUseCase } from '../../application/use-cases/admin/ToggleUserBlockUseCase';
import { sendSuccess } from '../helpers/response.helper';

export class AdminController {
  constructor(
    private getAllUsersUseCase: GetAllUsersUseCase,
    private toggleUserBlockUseCase: ToggleUserBlockUseCase,
  ) {}

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.getAllUsersUseCase.execute();
      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  };

  toggleBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const adminUserId = req.user?.id;
      const user = await this.toggleUserBlockUseCase.execute(userId, adminUserId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };
}
