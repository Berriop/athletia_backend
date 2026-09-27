import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyEmailUseCase } from '../../application/use-cases/VerifyEmailUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ValidationError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';

// RF-28 — Verificación de correo electrónico. V(G)=3, 3 caminos básicos.
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
    isEmailVerified: false,
    emailVerificationToken: 'token-abc',
    resetPasswordToken: null,
    resetPasswordExpires: null,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('VerifyEmailUseCase', () => {
  let userRepository: IUserRepository;
  let useCase: VerifyEmailUseCase;

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
    useCase = new VerifyEmailUseCase(userRepository);
  });

  // Camino 1: INICIO,1,2,FIN
  it('Camino 1: token inválido o expirado → ValidationError', async () => {
    // Arrange
    vi.mocked(userRepository.findByEmailVerificationToken).mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute('token-invalido')).rejects.toThrow(ValidationError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,3,4,FIN
  it('Camino 2: usuario ya verificado → no vuelve a actualizar', async () => {
    // Arrange
    vi.mocked(userRepository.findByEmailVerificationToken).mockResolvedValue(
      user({ isEmailVerified: true }),
    );

    // Act
    await useCase.execute('token-abc');

    // Assert
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  // Camino 3: INICIO,1,3,5,6,FIN
  it('Camino 3: usuario no verificado → marca el correo como verificado y limpia el token', async () => {
    // Arrange
    vi.mocked(userRepository.findByEmailVerificationToken).mockResolvedValue(
      user({ isEmailVerified: false }),
    );
    vi.mocked(userRepository.update).mockResolvedValue(user({ isEmailVerified: true }));

    // Act
    await useCase.execute('token-abc');

    // Assert
    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      isEmailVerified: true,
      emailVerificationToken: null,
    });
  });
});
