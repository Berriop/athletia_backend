import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthPayload } from '../../domain/entities/AuthPayload';

export class JwtService {
  generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  verifyToken(token: string): AuthPayload {
    return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
  }
}
