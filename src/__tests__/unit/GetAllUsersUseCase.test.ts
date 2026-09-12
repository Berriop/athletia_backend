import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAllUsersUseCase } from '../../application/use-cases/admin/GetAllUsersUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
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

describe('GetAllUsersUseCase', () => {
  let userRepository: IUserRepository;
  let useCase: GetAllUsersUseCase;

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
    useCase = new GetAllUsersUseCase(userRepository);
  });

  // Camino único: INICIO,1,2,FIN
  it('Camino 1: lista los usuarios registrados sin exponer la contraseña de ninguno', async () => {
    // Arrange
    vi.mocked(userRepository.findAll).mockResolvedValue([
      user({ id: 'user-1', email: 'a@example.com' }),
      user({ id: 'user-2', email: 'b@example.com', role: 'ADMIN' }),
    ]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0]).not.toHaveProperty('password');
    expect(result[1]).not.toHaveProperty('password');
    expect(result[0].email).toBe('a@example.com');
    expect(result[1].role).toBe('ADMIN');
  });

  it('sin usuarios registrados → retorna una lista vacía', async () => {
    // Arrange
    vi.mocked(userRepository.findAll).mockResolvedValue([]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual([]);
  });
});
