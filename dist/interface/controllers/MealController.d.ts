import { Request, Response, NextFunction } from 'express';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { GetMealsUseCase } from '../../application/use-cases/meal/GetMealsUseCase';
import { GetMealByIdUseCase } from '../../application/use-cases/meal/GetMealByIdUseCase';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';
export declare class MealController {
    private createUseCase;
    private getAllUseCase;
    private getByIdUseCase;
    private updateUseCase;
    private deleteUseCase;
    constructor(createUseCase: CreateMealUseCase, getAllUseCase: GetMealsUseCase, getByIdUseCase: GetMealByIdUseCase, updateUseCase: UpdateMealUseCase, deleteUseCase: DeleteMealUseCase);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
