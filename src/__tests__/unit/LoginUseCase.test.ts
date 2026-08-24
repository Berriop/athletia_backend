import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IJwtService } from '../../domain/services/IJwtService';
import { UnauthorizedError, ForbiddenError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';

// RF-02 — Iniciar sesión. Basado en el diagrama "RF-02 Back (LoginUseCase)"
// (Patrón G, V(G)=5, 5 caminos básicos: usuario inexistente, bloqueado, sin
// contraseña, contraseña incorrecta, éxito).
function baseUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid-1',
    email: 'test@example.com',
    password: 'hashed_password',
    name: 'Test',
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

describe('LoginUseCase', () => {
  let userRepository: IUserRepository;
  let hashService: IHashService;
  let jwtService: IJwtService;
  let useCase: LoginUseCase;

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
    jwtService = {
      generateToken: vi.fn().mockReturnValue('mocked_jwt_token'),
      verifyToken: vi.fn(),
    };
    useCase = new LoginUseCase(userRepository, hashService, jwtService);
  });

  // Camino 1: usuario no existe
  it('Camino 1: correo no registrado → lanza UnauthorizedError (401)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'StrongP@ss1234' }),
    ).rejects.toThrow(UnauthorizedError);
  });

  // Camino 2: usuario existe pero bloqueado
  it('Camino 2: cuenta bloqueada → lanza ForbiddenError (403)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(baseUser({ isBlocked: true }));

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'StrongP@ss1234' }),
    ).rejects.toThrow(ForbiddenError);
    expect(hashService.compare).not.toHaveBeenCalled();
  });

  // Camino 3: usuario existe, no bloqueado, sin contraseña registrada (ej. cuenta social incompleta)
  it('Camino 3: usuario sin contraseña registrada → lanza UnauthorizedError (401)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(baseUser({ password: undefined }));

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'StrongP@ss1234' }),
    ).rejects.toThrow(UnauthorizedError);
    expect(hashService.compare).not.toHaveBeenCalled();
  });

  // Camino 4: contraseña no coincide
  it('Camino 4: contraseña incorrecta → lanza UnauthorizedError (401)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(baseUser());
    vi.mocked(hashService.compare).mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'WrongP@ssword1' }),
    ).rejects.toThrow(UnauthorizedError);
  });

  // Camino 5: credenciales correctas
  it('Camino 5: credenciales válidas → emite JWT y retorna el usuario sin contraseña', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(baseUser());
    vi.mocked(hashService.compare).mockResolvedValue(true);

    const result = await useCase.execute({ email: 'test@example.com', password: 'StrongP@ss1234' });

    expect(jwtService.generateToken).toHaveBeenCalledWith({
      id: 'user-uuid-1',
      email: 'test@example.com',
      role: 'USER',
    });
    expect(result.token).toBe('mocked_jwt_token');
    expect(result.user).not.toHaveProperty('password');
  });
});
