import { describe, it, vi, beforeEach } from 'vitest';
import { expect as chaiExpect } from 'chai';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { GetAllUsersUseCase } from '../../application/use-cases/admin/GetAllUsersUseCase';
import { ToggleUserBlockUseCase } from '../../application/use-cases/admin/ToggleUserBlockUseCase';
import { NotFoundError, ForbiddenError } from '../../domain/errors/AppError';
import { Meal } from '../../domain/entities/Meal';
import { SleepLog } from '../../domain/entities/SleepLog';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';

/**
 * Pruebas con Fluent Assertions (chai) para las funcionalidades de backend
 * asignadas a Daniel Ortiz: RF-09, RF-10, RF-11, RF-27, RF-30.
 * (RF-26 no tiene backend propio — ver el archivo de frontend.)
 */

function genericRepo<T>() {
  return { create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() } as any as T & Record<string, ReturnType<typeof vi.fn>>;
}

function meal(overrides: Partial<Meal> = {}): Meal {
  return {
    id: 'meal-1', name: 'Ensalada', calories: 400, mealType: 'LUNCH', proteinG: 20, carbsG: 30,
    fatG: 10, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function sleepLog(overrides: Partial<SleepLog> = {}): SleepLog {
  return {
    id: 'sleep-1', hoursSlept: 7, sleepQuality: 8, hadNightmares: false, stressLevel: 3,
    notes: null, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1', email: 'user@test.com', password: 'hashed', name: 'Jane', birthDate: null,
    gender: null, heightCm: null, weightKg: null, experienceLevel: null, role: 'USER',
    isEmailVerified: false, emailVerificationToken: null, resetPasswordToken: 'reset-token',
    resetPasswordExpires: new Date(Date.now() + 15 * 60_000), isBlocked: false,
    createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function makeUserRepository(): IUserRepository {
  return {
    findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(),
    findByResetToken: vi.fn(), findByEmailVerificationToken: vi.fn(), findAll: vi.fn(),
  };
}

describe('RF-09 — UpdateMealUseCase (Fluent Assertions)', () => {
  it('comida válida y propia → retorna la comida actualizada', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(meal());
    vi.mocked(repo.update).mockResolvedValue(meal({ calories: 500 }));
    const useCase = new UpdateMealUseCase(repo);

    const result = await useCase.execute('meal-1', 'user-1', { calories: 500 } as any);

    chaiExpect(result).to.have.property('calories', 500);
  });
});

describe('RF-10 — DeleteMealUseCase (Fluent Assertions)', () => {
  it('comida existente pero la eliminación falla → NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(meal());
    vi.mocked(repo.delete).mockResolvedValue(false);
    const useCase = new DeleteMealUseCase(repo);

    try {
      await useCase.execute('meal-1', 'user-1');
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError);
    }
  });
});

describe('RF-11 — CreateSleepUseCase (Fluent Assertions)', () => {
  it('datos válidos → crea el registro de sueño con notes normalizado a null', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(sleepLog());
    const useCase = new CreateSleepUseCase(repo);

    await useCase.execute('user-1', { hoursSlept: 7, sleepQuality: 8, stressLevel: 3 } as any);

    chaiExpect(repo.create.mock.calls[0][0]).to.include({ userId: 'user-1', notes: null });
  });
});

describe('RF-27 (parte 1) — ForgotPasswordUseCase (Fluent Assertions)', () => {
  let userRepository: IUserRepository;
  let useCase: ForgotPasswordUseCase;

  beforeEach(() => {
    userRepository = makeUserRepository();
  });

  it('correo no registrado → no revela nada y no lanza error', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    useCase = new ForgotPasswordUseCase(userRepository, {} as any);

    const result = await useCase.execute('nadie@test.com');

    chaiExpect(result).to.be.undefined;
    chaiExpect(vi.mocked(userRepository.update).mock.calls).to.have.lengthOf(0);
  });

  it('cuenta bloqueada → ForbiddenError', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user({ isBlocked: true }));
    useCase = new ForgotPasswordUseCase(userRepository, {} as any);

    try {
      await useCase.execute('user@test.com');
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(ForbiddenError);
    }
  });
});

describe('RF-27 (parte 2) — ResetPasswordUseCase (Fluent Assertions)', () => {
  it('token válido y vigente → actualiza la contraseña y limpia el token', async () => {
    const userRepository = makeUserRepository();
    const hashService: IHashService = { hash: vi.fn(), compare: vi.fn() };
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(user());
    vi.mocked(hashService.hash).mockResolvedValue('nuevo-hash');
    const useCase = new ResetPasswordUseCase(userRepository, hashService);

    await useCase.execute('reset-token', 'NuevaClave123!');

    chaiExpect(vi.mocked(userRepository.update).mock.calls[0][1]).to.deep.include({
      password: 'nuevo-hash',
      resetPasswordToken: null,
    });
  });
});

describe('RF-30 (parte 1) — GetAllUsersUseCase (Fluent Assertions)', () => {
  it('lista los usuarios sin exponer la contraseña de ninguno', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.findAll).mockResolvedValue([user({ id: 'u1' }), user({ id: 'u2', role: 'ADMIN' })]);
    const useCase = new GetAllUsersUseCase(userRepository);

    const result = await useCase.execute();

    chaiExpect(result).to.be.an('array').with.lengthOf(2);
    chaiExpect(result.every((u) => !('password' in u))).to.be.true;
  });
});

describe('RF-30 (parte 2) — ToggleUserBlockUseCase (Fluent Assertions)', () => {
  it('el admin intenta bloquear su propia cuenta → ForbiddenError', async () => {
    const userRepository = makeUserRepository();
    const useCase = new ToggleUserBlockUseCase(userRepository);

    try {
      await useCase.execute('admin-1', 'admin-1');
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(ForbiddenError);
    }
  });

  it('usuario objetivo válido → invierte isBlocked', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.findById).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ isBlocked: true }));
    const useCase = new ToggleUserBlockUseCase(userRepository);

    const result = await useCase.execute('user-1', 'admin-1');

    chaiExpect(result.isBlocked).to.be.true;
  });
});
