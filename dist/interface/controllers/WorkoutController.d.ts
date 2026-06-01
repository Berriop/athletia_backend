import { Request, Response } from 'express';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { GetWorkoutsUseCase } from '../../application/use-cases/workout/GetWorkoutsUseCase';
import { GetWorkoutByIdUseCase } from '../../application/use-cases/workout/GetWorkoutByIdUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
export declare class WorkoutController {
    private createUseCase;
    private getAllUseCase;
    private getByIdUseCase;
    private updateUseCase;
    private deleteUseCase;
    constructor(createUseCase: CreateWorkoutUseCase, getAllUseCase: GetWorkoutsUseCase, getByIdUseCase: GetWorkoutByIdUseCase, updateUseCase: UpdateWorkoutUseCase, deleteUseCase: DeleteWorkoutUseCase);
    create(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
