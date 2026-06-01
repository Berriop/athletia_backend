import { AuthPayload } from '../entities/AuthPayload';
export interface IJwtService {
    generateToken(payload: AuthPayload): string;
    verifyToken(token: string): AuthPayload;
}
