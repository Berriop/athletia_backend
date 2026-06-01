import { AuthPayload } from '../../domain/entities/AuthPayload';
export declare class JwtService {
    generateToken(payload: AuthPayload): string;
    verifyToken(token: string): AuthPayload;
}
