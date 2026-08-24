import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ValidationError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';

// RF-32 (parte 2) — Restablecer con el token. Basado en el diagrama "RF-32
// Back Parte 2 (ResetPasswordUseCase)" (V(G)=2, 2 caminos básicos).
//
// Nota de arquitectura: a diferencia del resto de use-cases, este llama a
// `bcrypt` directamente en vez de pasar por la abstracción IHashService
// (inconsistencia ya señalada en el análisis del proyecto). Por eso aquí no
// se mockea el hash — se deja correr bcrypt real, que es determinista en su
// resultado (siempre produce un hash válido) aunque el valor cambie cada vez.
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
    useCase = new ResetPasswordUseCase(userRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN — cubre las 3 variantes de token inválido
  it('Camino 1a: token inexistente → ValidationError (400), no cambia nada', async () => {
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(null);

    await expect(useCase.execute('bad-token', 'NewStr0ng@Pass')).rejects.toThrow(ValidationError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('Camino 1b: token sin fecha de expiración registrada → ValidationError (400)', async () => {
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(user({ resetPasswordExpires: null }));

    await expect(useCase.execute('valid-token', 'NewStr0ng@Pass')).rejects.toThrow(ValidationError);
  });

  it('Camino 1c: token vencido (expiró hace más de 15 minutos) → ValidationError (400)', async () => {
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(
      user({ resetPasswordExpires: new Date(Date.now() - 60 * 1000) }),
    );

    await expect(useCase.execute('valid-token', 'NewStr0ng@Pass')).rejects.toThrow(ValidationError);
  });

  // Camino 2: INICIO,1,2,4,5,FIN
  it('Camino 2: token válido y vigente → actualiza la contraseña y limpia el token', async () => {
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(user());
    vi.mocked(userRepository.update).mockResolvedValue(user());

    await useCase.execute('valid-token', 'NewStr0ng@Pass');

    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ resetPasswordToken: null, resetPasswordExpires: null }),
    );
    const newHash = vi.mocked(userRepository.update).mock.calls[0][1].password as string;
    expect(newHash).not.toBe('old_hashed_password');
    await expect(bcrypt.compare('NewStr0ng@Pass', newHash)).resolves.toBe(true);
  });
});
