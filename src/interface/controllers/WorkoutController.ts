import { Request, Response, NextFunction } from 'express';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { GetWorkoutsUseCase } from '../../application/use-cases/workout/GetWorkoutsUseCase';
import { GetWorkoutByIdUseCase } from '../../application/use-cases/workout/GetWorkoutByIdUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
import { sendCreated, sendNoContent, sendSuccess } from '../helpers/response.helper';

export class WorkoutController {
  constructor(
    private createUseCase: CreateWorkoutUseCase,
    private getAllUseCase: GetWorkoutsUseCase,
    private getByIdUseCase: GetWorkoutByIdUseCase,
    private updateUseCase: UpdateWorkoutUseCase,
    private deleteUseCase: DeleteWorkoutUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workout = await this.createUseCase.execute(userId, req.body);
      sendCreated(res, workout);
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
      const workout = await this.getByIdUseCase.execute(String(req.params['id']), userId);
      sendSuccess(res, workout);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workout = await this.updateUseCase.execute(String(req.params['id']), userId, req.body);
      sendSuccess(res, workout);
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
