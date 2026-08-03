import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IJwtService } from '../../domain/services/IJwtService';
import { UnauthorizedError } from '../../domain/errors/AppError';

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

  it('authenticates user with valid credentials and returns token', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(hashService.compare).mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'StrongP@ss1234',
    });

    expect(result.token).toBe('mocked_jwt_token');
    expect(result.user).not.toHaveProperty('password');
  });

  it('throws UnauthorizedError if user email is not found', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'unknown@example.com',
        password: 'StrongP@ss1234',
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError if password comparison fails', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(hashService.compare).mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'WrongP@ssword1',
      }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
