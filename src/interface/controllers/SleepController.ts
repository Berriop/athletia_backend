import { Request, Response, NextFunction } from 'express';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { GetSleepsUseCase } from '../../application/use-cases/sleep/GetSleepsUseCase';
import { GetSleepByIdUseCase } from '../../application/use-cases/sleep/GetSleepByIdUseCase';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
import { sendCreated, sendNoContent, sendSuccess } from '../helpers/response.helper';

export class SleepController {
  constructor(
    private createUseCase: CreateSleepUseCase,
    private getAllUseCase: GetSleepsUseCase,
    private getByIdUseCase: GetSleepByIdUseCase,
    private updateUseCase: UpdateSleepUseCase,
    private deleteUseCase: DeleteSleepUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sleep = await this.createUseCase.execute(userId, req.body);
      sendCreated(res, sleep);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getAllUseCase.execute(userId, res.locals.query ?? req.query);
      sendSuccess(res, result.data, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sleep = await this.getByIdUseCase.execute(String(req.params['id']), userId);
      sendSuccess(res, sleep);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sleep = await this.updateUseCase.execute(String(req.params['id']), userId, req.body);
      sendSuccess(res, sleep);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await this.deleteUseCase.execute(String(req.params['id']), userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}
