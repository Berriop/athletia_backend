import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToggleUserBlockUseCase } from '../../application/use-cases/admin/ToggleUserBlockUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ForbiddenError, NotFoundError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user1@example.com',
    password: 'hashed_pwd',
    name: 'User One',
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

  // Camino 1: INICIO,1,2,FIN — un admin intenta bloquearse a sí mismo
  it('Camino 1: el admin intenta bloquear su propia cuenta → ForbiddenError (403)', async () => {
    // Arrange & Act & Assert
    await expect(useCase.execute('admin-1', 'admin-1')).rejects.toThrow(ForbiddenError);
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,3,4,FIN — usuario inexistente
  it('Camino 2: el usuario a bloquear no existe → NotFoundError (404)', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute('user-404', 'admin-1')).rejects.toThrow(NotFoundError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  // Camino 3: INICIO,1,3,5,6,FIN — usuario activo → queda bloqueado
  it('Camino 3: usuario activo → lo bloquea y retorna el usuario actualizado sin contraseña', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ isBlocked: true }));

    // Act
    const result = await useCase.execute('user-1', 'admin-1');

    // Assert
    expect(userRepository.update).toHaveBeenCalledWith('user-1', { isBlocked: true });
    expect(result.isBlocked).toBe(true);
    expect(result).not.toHaveProperty('password');
  });

  // Mismo camino 3, sentido inverso — usuario ya bloqueado → queda desbloqueado
  it('usuario ya bloqueado → lo desbloquea (toggle inverso)', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(user({ isBlocked: true }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ isBlocked: false }));

    // Act
    const result = await useCase.execute('user-1', 'admin-1');

    // Assert
    expect(userRepository.update).toHaveBeenCalledWith('user-1', { isBlocked: false });
    expect(result.isBlocked).toBe(false);
  });

  // Camino sin adminUserId (p. ej. llamado internamente): no debe lanzar ForbiddenError
  it('sin adminUserId → no evalúa auto-bloqueo y bloquea con normalidad', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ isBlocked: true }));

    // Act
    const result = await useCase.execute('user-1');

    // Assert
    expect(result.isBlocked).toBe(true);
  });
});
