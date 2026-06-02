import { Request, Response, NextFunction } from 'express';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { GetMealsUseCase } from '../../application/use-cases/meal/GetMealsUseCase';
import { GetMealByIdUseCase } from '../../application/use-cases/meal/GetMealByIdUseCase';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';

export class MealController {
  constructor(
    private createUseCase: CreateMealUseCase,
    private getAllUseCase: GetMealsUseCase,
    private getByIdUseCase: GetMealByIdUseCase,
    private updateUseCase: UpdateMealUseCase,
    private deleteUseCase: DeleteMealUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const meal = await this.createUseCase.execute(userId, req.body);
      res.status(201).json({ success: true, data: meal });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.getAllUseCase.execute(userId, res.locals.query ?? req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const meal = await this.getByIdUseCase.execute(String(req.params['id']), userId);
      res.json({ success: true, data: meal });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const meal = await this.updateUseCase.execute(String(req.params['id']), userId, req.body);
      res.json({ success: true, data: meal });
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
