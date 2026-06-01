import { Request, Response, NextFunction } from 'express';
import { AuthPayload } from '../../domain/entities/AuthPayload';
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
