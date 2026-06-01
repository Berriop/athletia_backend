import { Request, Response, NextFunction } from 'express';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { GetSleepsUseCase } from '../../application/use-cases/sleep/GetSleepsUseCase';
import { GetSleepByIdUseCase } from '../../application/use-cases/sleep/GetSleepByIdUseCase';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';

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
      res.status(201).json({ success: true, data: sleep });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getAllUseCase.execute(userId, req.query as any);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sleep = await this.getByIdUseCase.execute(String(req.params['id']), userId);
      res.json({ success: true, data: sleep });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sleep = await this.updateUseCase.execute(String(req.params['id']), userId, req.body);
      res.json({ success: true, data: sleep });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await this.deleteUseCase.execute(String(req.params['id']), userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
