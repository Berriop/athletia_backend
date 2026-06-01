import { AuthPayload } from '../../domain/entities/AuthPayload';
import { IJwtService } from '../../domain/services/IJwtService';
export declare class JwtService implements IJwtService {
    generateToken(payload: AuthPayload): string;
    verifyToken(token: string): AuthPayload;
}
