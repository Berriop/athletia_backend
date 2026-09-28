import { describe, it, vi, beforeEach } from 'vitest';
import { expect as chaiExpect } from 'chai';
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
 * Pruebas con Fluent Assertions (chai) para las 6 funcionalidades asignadas
 * a Luisa Espinal: RF-01, RF-02, RF-03 (sin backend), RF-04, RF-22, RF-29.
 *
 * A diferencia de las pruebas "clásicas" (expect().toBe()), aquí se usa la
 * sintaxis encadenada de chai (expect(x).to.be...que...), que se lee más
 * cerca del lenguaje natural — el mismo estilo que muestra el README del
 * profesor para JavaScript con Chai (equivalente a AssertJ en Java y
 * PyHamcrest en Python).
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

// ---------------------------------------------------------------------------
// RF-01 — Registrar cuenta
// ---------------------------------------------------------------------------
describe('RF-01 — RegisterUseCase (Fluent Assertions)', () => {
  let userRepository: IUserRepository;
  let hashService: IHashService;
  let jwtService: IJwtService;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    userRepository = makeUserRepository();
    hashService = { hash: vi.fn(), compare: vi.fn() };
    jwtService = { generateToken: vi.fn(), verifyToken: vi.fn() } as unknown as IJwtService;
    useCase = new RegisterUseCase(userRepository, hashService, jwtService);
  });

  it('correo ya registrado → lanza ConflictError con el mensaje correcto', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user());

    try {
      await useCase.execute({ email: 'user@test.com', password: 'Abc12345!@#$' } as any);
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(ConflictError);
      chaiExpect((err as Error).message).to.equal('Email already in use');
    }
  });

  it('correo nuevo y contraseña válida → crea el usuario y retorna un token', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(hashService.hash).mockResolvedValue('hashed-pass');
    vi.mocked(userRepository.create).mockResolvedValue(user({ id: 'new-user', email: 'nuevo@test.com' }));
    vi.mocked(jwtService.generateToken).mockReturnValue('jwt-token-123');

    const result = await useCase.execute({ email: 'nuevo@test.com', password: 'Abc12345!@#$' } as any);

    chaiExpect(result).to.be.an('object').that.has.all.keys('user', 'token');
    chaiExpect(result.token).to.equal('jwt-token-123');
    chaiExpect(result.user).to.not.have.property('password');
    chaiExpect(result.user.email).to.equal('nuevo@test.com');
  });
});

// ---------------------------------------------------------------------------
// RF-02 — Iniciar sesión
// ---------------------------------------------------------------------------
describe('RF-02 — LoginUseCase (Fluent Assertions)', () => {
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

  it('correo no registrado → UnauthorizedError genérico (no revela si el correo existe)', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    try {
      await useCase.execute({ email: 'nadie@test.com', password: 'x' });
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(UnauthorizedError);
      chaiExpect((err as Error).message).to.match(/invalid credentials/i);
    }
  });

  it('cuenta bloqueada → ForbiddenError con mensaje explícito', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user({ isBlocked: true }));

    try {
      await useCase.execute({ email: 'user@test.com', password: 'x' });
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(ForbiddenError);
      chaiExpect((err as Error).message).to.contain('bloqueada');
    }
  });

  it('credenciales correctas → retorna un token junto con el usuario sin contraseña', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(hashService.compare).mockResolvedValue(true);
    vi.mocked(jwtService.generateToken).mockReturnValue('jwt-abc');

    const result = await useCase.execute({ email: 'user@test.com', password: 'correcta' });

    chaiExpect(result.token).to.be.a('string').and.to.equal('jwt-abc');
    chaiExpect(result.user).to.not.have.property('password');
    chaiExpect(result.user).to.include({ email: 'user@test.com', role: 'USER' });
  });
});

// ---------------------------------------------------------------------------
// RF-04 — Actualizar perfil propio
// ---------------------------------------------------------------------------
describe('RF-04 — UpdateProfileUseCase (Fluent Assertions)', () => {
  let userRepository: IUserRepository;
  let useCase: UpdateProfileUseCase;

  beforeEach(() => {
    userRepository = makeUserRepository();
    useCase = new UpdateProfileUseCase(userRepository);
  });

  it('userId inexistente → NotFoundError', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    try {
      await useCase.execute('no-existe', { name: 'X' });
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError);
    }
  });

  it('usuario existente → normaliza género y experiencia a mayúsculas y retorna el perfil sin contraseña', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(user());
    vi.mocked(userRepository.update).mockResolvedValue(
      user({ gender: 'MALE', experienceLevel: 'INTERMEDIATE' }),
    );

    const result = await useCase.execute('user-1', { gender: 'male', experienceLevel: 'intermediate' });

    chaiExpect(vi.mocked(userRepository.update).mock.calls).to.have.lengthOf(1);
    chaiExpect(vi.mocked(userRepository.update).mock.calls[0][1]).to.include({
      gender: 'MALE',
      experienceLevel: 'INTERMEDIATE',
    });
    chaiExpect(result.user).to.not.have.property('password');
  });
});

// ---------------------------------------------------------------------------
// RF-22 — Acceder al panel administrativo
// ---------------------------------------------------------------------------
describe('RF-22 — adminMiddleware (Fluent Assertions)', () => {
  function mockResponse(): Response {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  }

  it('sin usuario autenticado → responde 401 y no llama a next()', () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    chaiExpect(vi.mocked(res.status).mock.calls[0][0]).to.equal(401);
    chaiExpect(vi.mocked(next).mock.calls).to.have.lengthOf(0);
  });

  it('usuario autenticado sin rol ADMIN → responde 403', () => {
    const req = { user: { id: 'u1', email: 'u@test.com', role: 'USER' } } as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    chaiExpect(vi.mocked(res.status).mock.calls[0][0]).to.equal(403);
    chaiExpect(vi.mocked(next).mock.calls).to.have.lengthOf(0);
  });

  it('usuario ADMIN → continúa a la ruta protegida sin responder error', () => {
    const req = { user: { id: 'a1', email: 'a@test.com', role: 'ADMIN' } } as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    chaiExpect(vi.mocked(next).mock.calls).to.have.lengthOf(1);
    chaiExpect(vi.mocked(res.status).mock.calls).to.have.lengthOf(0);
  });
});

// ---------------------------------------------------------------------------
// RF-29 — Exportar historial
// ---------------------------------------------------------------------------
vi.mock('../../infrastructure/database/prisma', () => ({
  prisma: {
    workout: { findMany: vi.fn() },
    meal: { findMany: vi.fn() },
    sleepLog: { findMany: vi.fn() },
    injury: { findMany: vi.fn() },
  },
}));

describe('RF-29 — ExportUserDataUseCase (Fluent Assertions)', () => {
  let userRepository: IUserRepository;
  let useCase: ExportUserDataUseCase;

  beforeEach(async () => {
    vi.clearAllMocks();
    userRepository = makeUserRepository();
    useCase = new ExportUserDataUseCase(userRepository);
    const { prisma } = await import('../../infrastructure/database/prisma');
    vi.mocked(prisma.workout.findMany).mockResolvedValue([]);
    vi.mocked(prisma.meal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.sleepLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.injury.findMany).mockResolvedValue([]);
  });

  it('sin registros → el CSV contiene únicamente el encabezado esperado', async () => {
    const csv = await useCase.execute('user-1');

    chaiExpect(csv).to.be.a('string').that.equals('TYPE,DATE,DETAIL_1,DETAIL_2,DETAIL_3');
  });

  it('con un entrenamiento registrado → el CSV incluye una fila que contiene sus datos', async () => {
    const { prisma } = await import('../../infrastructure/database/prisma');
    vi.mocked(prisma.workout.findMany).mockResolvedValue([
      { title: 'Pierna', bodyPart: 'LEGS', durationMinutes: 45, date: new Date('2026-08-01') } as any,
    ]);

    const csv = await useCase.execute('user-1');
    const lines = csv.split('\n');

    chaiExpect(lines).to.have.lengthOf(2);
    chaiExpect(lines[1]).to.contain('WORKOUT').and.to.contain('Pierna');
  });
});
