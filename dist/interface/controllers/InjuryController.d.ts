import { Request, Response, NextFunction } from 'express';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { GetInjuriesUseCase } from '../../application/use-cases/injury/GetInjuriesUseCase';
import { GetInjuryByIdUseCase } from '../../application/use-cases/injury/GetInjuryByIdUseCase';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';
export declare class InjuryController {
    private createUseCase;
    private getAllUseCase;
    private getByIdUseCase;
    private updateUseCase;
    private deleteUseCase;
    constructor(createUseCase: CreateInjuryUseCase, getAllUseCase: GetInjuriesUseCase, getByIdUseCase: GetInjuryByIdUseCase, updateUseCase: UpdateInjuryUseCase, deleteUseCase: DeleteInjuryUseCase);
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
