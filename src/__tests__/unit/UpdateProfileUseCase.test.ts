import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';

// RF-05 — Actualizar perfil propio. Basado en el diagrama "RF-05 Back
// (UpdateProfileUseCase)" (Patrón I, V(G)=2, 2 caminos básicos).
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

describe('UpdateProfileUseCase', () => {
  let userRepository: IUserRepository;
  let useCase: UpdateProfileUseCase;

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
    useCase = new UpdateProfileUseCase(userRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: userId no corresponde a ningún usuario → NotFoundError (404)', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute('user-1', { name: 'Nuevo nombre' })).rejects.toThrow(NotFoundError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,FIN
  it('Camino 2: usuario existe → normaliza género/experiencia y actualiza sin exponer la contraseña', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(user());
    vi.mocked(userRepository.update).mockResolvedValue(
      user({ name: 'Nuevo nombre', gender: 'MALE', experienceLevel: 'ADVANCED' }),
    );

    // Act
    const result = await useCase.execute('user-1', {
      name: 'Nuevo nombre',
      gender: 'male',
      experienceLevel: 'advanced',
    });

    // Assert
    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ name: 'Nuevo nombre', gender: 'MALE', experienceLevel: 'ADVANCED' }),
    );
    expect(result.user).not.toHaveProperty('password');
  });

  it('campos opcionales enviados como cadena vacía se guardan como null (se eliminan)', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(user({ gender: 'MALE' }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ gender: null }));

    // Act
    await useCase.execute('user-1', { gender: '', birthDate: '', experienceLevel: '' });

    // Assert
    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ gender: null, birthDate: null, experienceLevel: null }),
    );
  });

  it('campos opcionales enviados como null se guardan como null (se eliminan)', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(user({ gender: 'MALE' }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ gender: null }));

    // Act
    await useCase.execute('user-1', { gender: null, birthDate: null, experienceLevel: null });

    // Assert
    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ gender: null, birthDate: null, experienceLevel: null }),
    );
  });

  it('un birthDate válido (ISO string) se convierte a Date en el payload', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(user());
    vi.mocked(userRepository.update).mockResolvedValue(user());

    // Act
    await useCase.execute('user-1', { birthDate: '2000-05-10' });

    // Assert
    const payload = vi.mocked(userRepository.update).mock.calls[0][1] as Record<string, unknown>;
    expect(payload.birthDate).toEqual(new Date('2000-05-10'));
  });

  it('un campo opcional que no se envía (undefined) no se toca', async () => {
    // Arrange
    vi.mocked(userRepository.findById).mockResolvedValue(user());
    vi.mocked(userRepository.update).mockResolvedValue(user());

    // Act
    await useCase.execute('user-1', { name: 'Solo el nombre cambia' });

    // Assert
    const payload = vi.mocked(userRepository.update).mock.calls[0][1];
    expect(payload).not.toHaveProperty('gender');
    expect(payload).not.toHaveProperty('birthDate');
  });
});
