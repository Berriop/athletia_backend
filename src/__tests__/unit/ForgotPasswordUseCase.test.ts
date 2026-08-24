import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../infrastructure/services/EmailService';
import { ForbiddenError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';

// RF-32 (parte 1) — Solicitar recuperación. Basado en el diagrama "RF-32 Back
// Parte 1 (ForgotPasswordUseCase)" (V(G)=3, 3 caminos básicos).
function user(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed',
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

describe('ForgotPasswordUseCase', () => {
  let userRepository: IUserRepository;
  let emailService: IEmailService;
  let useCase: ForgotPasswordUseCase;

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
    emailService = {
      sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
      sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new ForgotPasswordUseCase(userRepository, emailService);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: correo no registrado → no hace nada (no revela si el correo existe)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(useCase.execute('unknown@example.com')).resolves.toBeUndefined();
    expect(userRepository.update).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,FIN
  it('Camino 2: correo registrado pero cuenta bloqueada → ForbiddenError (403)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user({ isBlocked: true }));

    await expect(useCase.execute('test@example.com')).rejects.toThrow(ForbiddenError);
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  // Camino 3: INICIO,1,2,4,6,7,FIN
  it('Camino 3: correo registrado y cuenta activa → genera token (15 min) y envía el correo', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user());

    await useCase.execute('test@example.com');

    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ resetPasswordToken: expect.any(String), resetPasswordExpires: expect.any(Date) }),
    );
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));

    const expiresArg = vi.mocked(userRepository.update).mock.calls[0][1].resetPasswordExpires as Date;
    const minutesUntilExpiry = (expiresArg.getTime() - Date.now()) / 60000;
    expect(minutesUntilExpiry).toBeGreaterThan(14);
    expect(minutesUntilExpiry).toBeLessThanOrEqual(15);
  });
});
