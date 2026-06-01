import { Request, Response, NextFunction } from 'express';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { GetInjuriesUseCase } from '../../application/use-cases/injury/GetInjuriesUseCase';
import { GetInjuryByIdUseCase } from '../../application/use-cases/injury/GetInjuryByIdUseCase';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';

export class InjuryController {
  constructor(
    private createUseCase: CreateInjuryUseCase,
    private getAllUseCase: GetInjuriesUseCase,
    private getByIdUseCase: GetInjuryByIdUseCase,
    private updateUseCase: UpdateInjuryUseCase,
    private deleteUseCase: DeleteInjuryUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const injury = await this.createUseCase.execute(userId, req.body);
      res.status(201).json({ success: true, data: injury });
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
      const injury = await this.getByIdUseCase.execute(String(req.params['id']), userId);
      res.json({ success: true, data: injury });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const injury = await this.updateUseCase.execute(String(req.params['id']), userId, req.body);
      res.json({ success: true, data: injury });
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
