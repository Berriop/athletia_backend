import { container } from '../../infrastructure/container';

/** Genera un JWT válido firmado con el secreto real de la aplicación. */
export function tokenFor(userId: string, role: 'USER' | 'ADMIN' = 'USER'): string {
  return container.jwtService.generateToken({
    id: userId,
    email: `${userId}@example.com`,
    role,
  });
}

export function bearer(token: string): string {
  return `Bearer ${token}`;
}
