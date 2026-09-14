import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAllUsersUseCase } from '../../application/use-cases/admin/GetAllUsersUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

// RF-30 (parte 1) — Listar usuarios en el panel de administración. Basado en
// el diagrama "RF-30 Back Parte 1 (GetAllUsersUseCase)" (Patrón A, V(G)=1,
// lineal, 1 camino básico).
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

  // Camino 1: INICIO,1,2,FIN
  it('Camino 1: retorna todos los usuarios sin exponer la contraseña', async () => {
    vi.mocked(userRepository.findAll).mockResolvedValue([
      user({ id: 'user-1' }),
      user({ id: 'user-2', role: 'ADMIN' }),
    ]);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).not.toHaveProperty('password');
    expect(result[1]).not.toHaveProperty('password');
    expect(result[0].id).toBe('user-1');
    expect(result[1].role).toBe('ADMIN');
  });

  it('Camino 1: retorna lista vacía cuando no hay usuarios', async () => {
    vi.mocked(userRepository.findAll).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
