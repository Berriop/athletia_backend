import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { UpdateProfileUseCase } from '../../application/use-cases/UpdateProfileUseCase';
import { ExportUserDataUseCase } from '../../application/use-cases/ExportUserDataUseCase';
import { adminMiddleware } from '../../interface/middlewares/admin.middleware';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IJwtService } from '../../domain/services/IJwtService';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../../domain/errors/AppError';
import { User } from '../../domain/entities/User';
import { Request, Response, NextFunction } from 'express';

/**
 * Suite de REGRESIÓN para las 6 funcionalidades asignadas a Luisa Espinal
 * (RF-01, RF-02, RF-03 sin backend, RF-04, RF-22, RF-29).
 *
 * Propósito: esta suite fija el comportamiento CORRECTO y ya validado de
 * estas 5 funciones de backend como línea base. Si un cambio futuro en el
 * código rompe alguno de estos comportamientos, esta suite debe fallar.
 *
 * Cómo demostrar la regresión en vivo (para la sustentación):
 *   1. Correr esta suite y confirmar que las 10 pruebas pasan (línea base).
 *   2. Introducir un defecto controlado, por ejemplo en LoginUseCase.ts
 *      cambiar `if (user.isBlocked)` por `if (!user.isBlocked)` (invierte
 *      la condición de bloqueo).
 *   3. Volver a correr `npx vitest run src/__tests__/regression` y mostrar
 *      que la prueba "una cuenta bloqueada no puede iniciar sesión" falla.
 *   4. Revertir el cambio y confirmar que la suite vuelve a pasar completa.
 *
 * El defecto del paso 2 es solo para la demostración: nunca debe quedar
 * commiteado.
 */

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
    isEmailVerified: false,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeUserRepository(): IUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findByResetToken: vi.fn(),
    findByEmailVerificationToken: vi.fn(),
    findAll: vi.fn(),
  };
}

describe('[Regresión] RF-01 — Registrar cuenta no debe permitir correos duplicados', () => {
  it('un correo ya registrado sigue bloqueando el registro con ConflictError', async () => {
    const userRepository = makeUserRepository();
    const hashService: IHashService = { hash: vi.fn(), compare: vi.fn() };
    const jwtService = { generateToken: vi.fn(), verifyToken: vi.fn() } as unknown as IJwtService;
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user());
    const useCase = new RegisterUseCase(userRepository, hashService, jwtService);

    await expect(
      useCase.execute({ email: 'user@test.com', password: 'Abc12345!@#$' } as any),
    ).rejects.toThrow(ConflictError);
  });
});

describe('[Regresión] RF-02 — Iniciar sesión respeta el bloqueo de cuenta y valida credenciales', () => {
  let userRepository: IUserRepository;
  let hashService: IHashService;
  let jwtService: IJwtService;
  let useCase: LoginUseCase;

  beforeEach(() => {
    userRepository = makeUserRepository();
    hashService = { hash: vi.fn(), compare: vi.fn() };
    jwtService = { generateToken: vi.fn(), verifyToken: vi.fn() } as unknown as IJwtService;
    useCase = new LoginUseCase(userRepository, hashService, jwtService);
  });

  it('una cuenta bloqueada no puede iniciar sesión', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user({ isBlocked: true }));

    await expect(useCase.execute({ email: 'user@test.com', password: 'x' })).rejects.toThrow(ForbiddenError);
  });

  it('una contraseña incorrecta sigue siendo rechazada', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(hashService.compare).mockResolvedValue(false);

    await expect(useCase.execute({ email: 'user@test.com', password: 'incorrecta' })).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it('credenciales correctas siguen emitiendo un token', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(hashService.compare).mockResolvedValue(true);
    vi.mocked(jwtService.generateToken).mockReturnValue('jwt-token');

    const result = await useCase.execute({ email: 'user@test.com', password: 'correcta' });

    expect(result.token).toBe('jwt-token');
  });
});

describe('[Regresión] RF-04 — Actualizar perfil sigue exigiendo un usuario existente', () => {
  it('un userId inexistente sigue lanzando NotFoundError', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.findById).mockResolvedValue(null);
    const useCase = new UpdateProfileUseCase(userRepository);

    await expect(useCase.execute('no-existe', { name: 'X' })).rejects.toThrow(NotFoundError);
  });

  it('la contraseña nunca se filtra en la respuesta del perfil actualizado', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.findById).mockResolvedValue(user());
    vi.mocked(userRepository.update).mockResolvedValue(user());
    const useCase = new UpdateProfileUseCase(userRepository);

    const result = await useCase.execute('user-1', { name: 'Nuevo nombre' });

    expect(result.user).not.toHaveProperty('password');
  });
});

describe('[Regresión] RF-22 — El panel administrativo sigue exigiendo rol ADMIN', () => {
  function mockResponse(): Response {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  }

  it('un usuario con rol USER sigue recibiendo 403, nunca pasa al siguiente middleware', () => {
    const req = { user: { id: 'u1', email: 'u@test.com', role: 'USER' } } as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('un usuario ADMIN sigue pudiendo continuar a la ruta protegida', () => {
    const req = { user: { id: 'a1', email: 'a@test.com', role: 'ADMIN' } } as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

vi.mock('../../infrastructure/database/prisma', () => ({
  prisma: {
    workout: { findMany: vi.fn() },
    meal: { findMany: vi.fn() },
    sleepLog: { findMany: vi.fn() },
    injury: { findMany: vi.fn() },
  },
}));

describe('[Regresión] RF-29 — El export sigue generando un CSV con encabezado fijo', () => {
  it('el encabezado del CSV no cambia entre versiones del código', async () => {
    const { prisma } = await import('../../infrastructure/database/prisma');
    vi.mocked(prisma.workout.findMany).mockResolvedValue([]);
    vi.mocked(prisma.meal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.sleepLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.injury.findMany).mockResolvedValue([]);
    const userRepository = makeUserRepository();
    const useCase = new ExportUserDataUseCase(userRepository);

    const csv = await useCase.execute('user-1');

    expect(csv).toBe('TYPE,DATE,DETAIL_1,DETAIL_2,DETAIL_3');
  });
});
