import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IJwtService } from '../../domain/services/IJwtService';
import { ConflictError } from '../../domain/errors/AppError';

describe('RegisterUseCase', () => {
  let userRepository: IUserRepository;
  let hashService: IHashService;
  let jwtService: IJwtService;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    hashService = {
      hash: vi.fn().mockResolvedValue('hashed_pwd_123'),
      compare: vi.fn(),
    };
    jwtService = {
      generateToken: vi.fn().mockReturnValue('mocked_jwt_token'),
      verifyToken: vi.fn(),
    };
    useCase = new RegisterUseCase(userRepository, hashService, jwtService);
  });

  it('registers a user successfully and returns user without password + token', async () => {
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
    expect(result.token).toBe('mocked_jwt_token');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe('test@example.com');
  });

  it('throws ConflictError when email is already in use', async () => {
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
  });
});
