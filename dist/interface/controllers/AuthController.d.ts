import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { GetMeUseCase } from '../../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase';
export declare class AuthController {
    private registerUseCase;
    private loginUseCase;
    private getMeUseCase;
    private updateProfileUseCase;
    constructor(registerUseCase: RegisterUseCase, loginUseCase: LoginUseCase, getMeUseCase: GetMeUseCase, updateProfileUseCase: UpdateProfileUseCase);
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
