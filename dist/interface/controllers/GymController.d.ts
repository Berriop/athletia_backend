import { Request, Response, NextFunction } from 'express';
import { NearbyGymsUseCase } from '../../application/use-cases/gym/NearbyGymsUseCase';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
export declare class GymController {
    private nearbyGymsUseCase;
    private searchGymsUseCase;
    constructor(nearbyGymsUseCase: NearbyGymsUseCase, searchGymsUseCase: SearchGymsUseCase);
    nearby(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
}
