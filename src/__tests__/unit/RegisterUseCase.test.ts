import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IJwtService } from '../../domain/services/IJwtService';
import { IEmailService } from '../../infrastructure/services/EmailService';
import { ConflictError } from '../../domain/errors/AppError';

// RF-01 — Registrar cuenta. Basado en el diagrama de flujo/grafo "RF-01 Back
// (RegisterUseCase)" (Patrón F, V(G)=2, 2 caminos básicos).
describe('RegisterUseCase', () => {
  let userRepository: IUserRepository;
  let hashService: IHashService;
  let jwtService: IJwtService;
  let emailService: IEmailService;
  let useCase: RegisterUseCase;

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
      hash: vi.fn().mockResolvedValue('hashed_pwd_123'),
      compare: vi.fn(),
    };
    jwtService = {
      generateToken: vi.fn().mockReturnValue('mocked_jwt_token'),
      verifyToken: vi.fn(),
    };
    emailService = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
      sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new RegisterUseCase(userRepository, hashService, jwtService, emailService);
  });

  // Camino 2: INICIO,1,2,4,5,6,FIN — correo disponible
  it('Camino 2: correo disponible → crea el usuario, emite JWT y envía correo de verificación', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'user-uuid-1',
      email: 'test@example.com',
      password: 'hashed_pwd_123',
      name: 'Test User',
      birthDate: null,
      gender: null,
      heightCm: null,
      weightKg: null,
      experienceLevel: null,
      role: 'USER',
      isEmailVerified: false,
      emailVerificationToken: 'some-token',
      resetPasswordToken: null,
      resetPasswordExpires: null,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'StrongP@ss1234',
      confirmPassword: 'StrongP@ss1234',
      name: 'Test User',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(hashService.hash).toHaveBeenCalledWith('StrongP@ss1234');
    expect(jwtService.generateToken).toHaveBeenCalledWith({
      id: 'user-uuid-1',
      email: 'test@example.com',
      role: 'USER',
    });
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
    expect(result.token).toBe('mocked_jwt_token');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe('test@example.com');
  });

  // Camino 1: INICIO,1,2,3,FIN — correo ya registrado
  it('Camino 1: correo ya registrado → lanza ConflictError (409) y no crea nada', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'existing-id',
      email: 'test@example.com',
      password: 'pwd',
      name: null,
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
    });

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'StrongP@ss1234',
        confirmPassword: 'StrongP@ss1234',
      }),
    ).rejects.toThrow(ConflictError);
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
