import { Request, Response } from 'express';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { GetWorkoutsUseCase } from '../../application/use-cases/workout/GetWorkoutsUseCase';
import { GetWorkoutByIdUseCase } from '../../application/use-cases/workout/GetWorkoutByIdUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';

export class WorkoutController {
  constructor(
    private createUseCase: CreateWorkoutUseCase,
    private getAllUseCase: GetWorkoutsUseCase,
    private getByIdUseCase: GetWorkoutByIdUseCase,
    private updateUseCase: UpdateWorkoutUseCase,
    private deleteUseCase: DeleteWorkoutUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const workout = await this.createUseCase.execute(userId, req.body);
    res.status(201).json(workout);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await this.getAllUseCase.execute(userId, req.query as any);
    res.json(result);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const workoutId = req.params.id as string;
    const workout = await this.getByIdUseCase.execute(workoutId, userId);
    res.json(workout);
  }

  async update(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const workoutId = req.params.id as string;
    const workout = await this.updateUseCase.execute(workoutId, userId, req.body);
    res.json(workout);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const workoutId = req.params.id as string;
    await this.deleteUseCase.execute(workoutId, userId);
    res.status(204).send();
  }
}
