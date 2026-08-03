import { Request, Response, NextFunction } from 'express';
import { NearbyGymsUseCase } from '../../application/use-cases/gym/NearbyGymsUseCase';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
import { sendSuccess } from '../helpers/response.helper';

export class GymController {
  constructor(
    private nearbyGymsUseCase: NearbyGymsUseCase,
    private searchGymsUseCase: SearchGymsUseCase,
  ) {}

  async nearby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gyms = await this.nearbyGymsUseCase.execute(res.locals.query ?? req.query);
      sendSuccess(res, gyms);
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gyms = await this.searchGymsUseCase.execute(res.locals.query ?? req.query);
      sendSuccess(res, gyms);
    } catch (error) {
      next(error);
    }
  }
}
