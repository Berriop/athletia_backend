import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToggleUserBlockUseCase } from '../../application/use-cases/admin/ToggleUserBlockUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ForbiddenError, NotFoundError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';

// RF-30 (parte 2) — Bloquear/desbloquear un usuario desde el panel de
// administración. Basado en el diagrama "RF-30 Back Parte 2
// (ToggleUserBlockUseCase)" (Patrón A, V(G)=3, 3 caminos básicos).
function user(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@test.com',
    password: 'hashed-secret',
    name: 'Jane Doe',
    birthDate: null,
    gender: null,
    heightCm: null,
    weightKg: null,
    experienceLevel: null,
    role: 'USER',
    isEmailVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ToggleUserBlockUseCase', () => {
  let userRepository: IUserRepository;
  let useCase: ToggleUserBlockUseCase;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findByResetToken: vi.fn(),
      findByEmailVerificationToken: vi.fn(),
      findAll: vi.fn(),
    };
    useCase = new ToggleUserBlockUseCase(userRepository);
  });

  // Camino 1: INICIO,1,FIN
  it('Camino 1: un admin intenta bloquearse a sí mismo → ForbiddenError', async () => {
    await expect(useCase.execute('admin-1', 'admin-1')).rejects.toThrow(ForbiddenError);
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,3,FIN
  it('Camino 2: usuario objetivo no existe → NotFoundError', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'admin-1')).rejects.toThrow(NotFoundError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  // Camino 3: INICIO,1,2,4,5,6,FIN
  it('Camino 3: usuario existe → invierte isBlocked y retorna sin la contraseña', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ isBlocked: true }));

    const result = await useCase.execute('user-1', 'admin-1');

    expect(userRepository.update).toHaveBeenCalledWith('user-1', { isBlocked: true });
    expect(result).not.toHaveProperty('password');
    expect(result.isBlocked).toBe(true);
  });

  it('Camino 3: no requiere adminUserId (llamada sin verificación de auto-bloqueo)', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ isBlocked: true }));

    const result = await useCase.execute('user-1');

    expect(result.isBlocked).toBe(true);
  });
});
