import { Request, Response, NextFunction } from 'express';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { GetSleepsUseCase } from '../../application/use-cases/sleep/GetSleepsUseCase';
import { GetSleepByIdUseCase } from '../../application/use-cases/sleep/GetSleepByIdUseCase';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
export declare class SleepController {
    private createUseCase;
    private getAllUseCase;
    private getByIdUseCase;
    private updateUseCase;
    private deleteUseCase;
    constructor(createUseCase: CreateSleepUseCase, getAllUseCase: GetSleepsUseCase, getByIdUseCase: GetSleepByIdUseCase, updateUseCase: UpdateSleepUseCase, deleteUseCase: DeleteSleepUseCase);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
