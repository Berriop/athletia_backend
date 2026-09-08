import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { ValidationError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';

// RF-32 (parte 2) — Restablecer con el token. Basado en el diagrama "RF-32
// Back Parte 2 (ResetPasswordUseCase)" (V(G)=2, 2 caminos básicos).
//
// Nota de arquitectura: este use-case usa la abstracción IHashService (igual
// que el resto del proyecto). Aquí se mockea el hashService para aislar la
// lógica del use-case de la implementación criptográfica real.
function user(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    password: 'old_hashed_password',
    name: 'Test',
    birthDate: null,
    gender: null,
    heightCm: null,
    weightKg: null,
    experienceLevel: null,
    role: 'USER',
    isEmailVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: 'valid-token',
    resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000),
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ResetPasswordUseCase', () => {
  let userRepository: IUserRepository;
  let hashService: IHashService;
  let useCase: ResetPasswordUseCase;

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
    hashService = {
      hash: vi.fn(),
      compare: vi.fn(),
    };
    useCase = new ResetPasswordUseCase(userRepository, hashService);
  });

  // Camino 1: INICIO,1,2,3,FIN — cubre las 3 variantes de token inválido
  it('Camino 1a: token inexistente → ValidationError (400), no cambia nada', async () => {
    // Arrange
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute('bad-token', 'NewStr0ng@Pass')).rejects.toThrow(ValidationError);
    expect(userRepository.update).not.toHaveBeenCalled();
    expect(hashService.hash).not.toHaveBeenCalled();
  });

  it('Camino 1b: token sin fecha de expiración registrada → ValidationError (400)', async () => {
    // Arrange
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(user({ resetPasswordExpires: null }));

    // Act & Assert
    await expect(useCase.execute('valid-token', 'NewStr0ng@Pass')).rejects.toThrow(ValidationError);
  });

  it('Camino 1c: token vencido (expiró hace más de 15 minutos) → ValidationError (400)', async () => {
    // Arrange
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(
      user({ resetPasswordExpires: new Date(Date.now() - 60 * 1000) }),
    );

    // Act & Assert
    await expect(useCase.execute('valid-token', 'NewStr0ng@Pass')).rejects.toThrow(ValidationError);
  });

  // Camino 2: INICIO,1,2,4,5,FIN
  it('Camino 2: token válido y vigente → hashea la nueva contraseña y limpia el token', async () => {
    // Arrange
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(user());
    vi.mocked(hashService.hash).mockResolvedValue('hashed_new_password');
    vi.mocked(userRepository.update).mockResolvedValue(user());

    // Act
    await useCase.execute('valid-token', 'NewStr0ng@Pass');

    // Assert
    expect(hashService.hash).toHaveBeenCalledWith('NewStr0ng@Pass');
    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        password: 'hashed_new_password',
        resetPasswordToken: null,
        resetPasswordExpires: null,
      }),
    );
  });
});