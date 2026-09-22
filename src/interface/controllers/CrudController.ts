import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendNoContent, sendSuccess, PaginationMeta } from '../helpers/response.helper';

interface CreateUseCase<T> {
  execute(userId: string, data: any): Promise<T>;
}

interface GetAllUseCase<T> {
  execute(userId: string, query: any): Promise<{ data: T[]; meta: PaginationMeta }>;
}

interface GetByIdUseCase<T> {
  execute(id: string, userId: string): Promise<T>;
}

interface UpdateUseCase<T> {
  execute(id: string, userId: string, data: any): Promise<T>;
}

interface DeleteUseCase {
  execute(id: string, userId: string): Promise<void>;
}

// Controladores concretos (SleepController, WorkoutController, etc.) solo
// tipan sus use-cases específicos y delegan aquí: los cinco endpoints REST
// (create/getAll/getById/update/delete) son idénticos para toda entidad con
// forma { userId }.
export abstract class CrudController<T> {
  constructor(
    private readonly createUseCase: CreateUseCase<T>,
    private readonly getAllUseCase: GetAllUseCase<T>,
    private readonly getByIdUseCase: GetByIdUseCase<T>,
    private readonly updateUseCase: UpdateUseCase<T>,
    private readonly deleteUseCase: DeleteUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const created = await this.createUseCase.execute(userId, req.body);
      sendCreated(res, created);
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
      const item = await this.getByIdUseCase.execute(String(req.params['id']), userId);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const updated = await this.updateUseCase.execute(String(req.params['id']), userId, req.body);
      sendSuccess(res, updated);
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
