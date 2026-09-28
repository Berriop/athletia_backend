import { describe, it, vi, beforeEach } from 'vitest';
import { expect as chaiExpect } from 'chai';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { GetAllUsersUseCase } from '../../application/use-cases/admin/GetAllUsersUseCase';
import { ToggleUserBlockUseCase } from '../../application/use-cases/admin/ToggleUserBlockUseCase';
import { NotFoundError, ForbiddenError } from '../../domain/errors/AppError';
import { SleepLog } from '../../domain/entities/SleepLog';
import { Injury } from '../../domain/entities/Injury';
import { Workout } from '../../domain/entities/Workout';
import { Meal } from '../../domain/entities/Meal';
import { Gym } from '../../domain/entities/Gym';
import { User } from '../../domain/entities/User';
import { IGoogleMapsService } from '../../domain/services/IGoogleMapsService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';

/**
 * Pruebas con Fluent Assertions (chai) para las 18 funcionalidades de
 * backend asignadas a Juan Pablo Berrío, Michael Pardo y Daniel Ortiz
 * (RF-05 a RF-16, RF-18, RF-27, RF-30). Ver src/__tests__/fluent-assertions/
 * backend.fluent.test.ts para las de Luisa Espinal.
 */

function genericRepo<T>() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  } as any as T & Record<string, ReturnType<typeof vi.fn>>;
}

function sleepLog(overrides: Partial<SleepLog> = {}): SleepLog {
  return {
    id: 'sleep-1', hoursSlept: 7, sleepQuality: 8, hadNightmares: false, stressLevel: 3,
    notes: null, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function injury(overrides: Partial<Injury> = {}): Injury {
  return {
    id: 'injury-1', bodyArea: 'Rodilla', injuryName: 'Esguince', severity: 5, isActive: true,
    notes: null, userId: 'user-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function workout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'workout-1', title: 'Pierna', description: null, bodyPart: 'LEGS', durationMinutes: 45,
    energyLevel: 7, fatigueLevel: 4, painLevel: 1, date: new Date(), userId: 'user-1',
    createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function meal(overrides: Partial<Meal> = {}): Meal {
  return {
    id: 'meal-1', name: 'Ensalada', calories: 400, mealType: 'LUNCH', proteinG: 20, carbsG: 30,
    fatG: 10, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function gym(overrides: Partial<Gym> = {}): Gym {
  return {
    placeId: 'place-1', name: 'Smart Fit', address: 'Medellín', lat: 6.2, lng: -75.5,
    rating: 4.5, userRatingsTotal: 300, openNow: true, types: ['gym'],
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

// ===================== Juan Pablo Berrío =====================

describe('RF-12 — UpdateSleepUseCase (Fluent Assertions)', () => {
  it('registro inexistente o de otro usuario → NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    const useCase = new UpdateSleepUseCase(repo);

    try {
      await useCase.execute('sleep-x', 'user-1', {});
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError);
    }
  });

  it('registro válido y propio → retorna el registro actualizado', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(sleepLog());
    vi.mocked(repo.update).mockResolvedValue(sleepLog({ hoursSlept: 6 }));
    const useCase = new UpdateSleepUseCase(repo);

    const result = await useCase.execute('sleep-1', 'user-1', { hoursSlept: 6 });

    chaiExpect(result).to.be.an('object').with.property('hoursSlept', 6);
  });
});

describe('RF-13 — DeleteSleepUseCase (Fluent Assertions)', () => {
  it('registro válido y propio → se elimina sin lanzar error', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(sleepLog());
    vi.mocked(repo.delete).mockResolvedValue(true);
    const useCase = new DeleteSleepUseCase(repo);

    await useCase.execute('sleep-1', 'user-1');

    chaiExpect(repo.delete).to.have.property('mock');
    chaiExpect(repo.delete.mock.calls[0]).to.deep.equal(['sleep-1', 'user-1']);
  });
});

describe('RF-14 — CreateInjuryUseCase (Fluent Assertions)', () => {
  it('datos válidos → crea la lesión y la retorna', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(injury());
    const useCase = new CreateInjuryUseCase(repo);

    const result = await useCase.execute('user-1', { bodyArea: 'Rodilla', injuryName: 'Esguince', severity: 5 } as any);

    chaiExpect(result).to.deep.equal(injury());
    chaiExpect(repo.create.mock.calls[0][0]).to.include({ userId: 'user-1', notes: null });
  });
});

describe('RF-15 — UpdateInjuryUseCase (Fluent Assertions)', () => {
  it('lesión inexistente o de otro usuario → NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    const useCase = new UpdateInjuryUseCase(repo);

    try {
      await useCase.execute('injury-x', 'user-1', {});
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError).and.to.have.property('message', 'Injury not found');
    }
  });
});

describe('RF-16 — DeleteInjuryUseCase (Fluent Assertions)', () => {
  it('lesión válida y propia → se elimina correctamente', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(injury());
    vi.mocked(repo.delete).mockResolvedValue(true);
    const useCase = new DeleteInjuryUseCase(repo);

    await useCase.execute('injury-1', 'user-1');

    chaiExpect(repo.findById.mock.calls[0]).to.deep.equal(['injury-1', 'user-1']);
  });
});

describe('RF-18 — SearchGymsUseCase (Fluent Assertions)', () => {
  it('búsqueda por texto con coordenadas → delega al servicio y retorna los gimnasios', async () => {
    const service: IGoogleMapsService = { findNearbyGyms: vi.fn(), searchGyms: vi.fn() };
    vi.mocked(service.searchGyms).mockResolvedValue([gym(), gym({ placeId: 'place-2' })]);
    const useCase = new SearchGymsUseCase(service);

    const result = await useCase.execute({ q: 'crossfit', lat: 6.2, lng: -75.5 });

    chaiExpect(result).to.be.an('array').with.lengthOf(2);
    chaiExpect(result[0]).to.have.property('name').that.is.a('string');
  });
});

// ===================== Michael Pardo =====================

describe('RF-05 — CreateWorkoutUseCase (Fluent Assertions)', () => {
  it('datos válidos → crea el entrenamiento', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(workout());
    const useCase = new CreateWorkoutUseCase(repo);

    const result = await useCase.execute('user-1', { title: 'Pierna', bodyPart: 'LEGS', durationMinutes: 45 } as any);

    chaiExpect(result).to.include({ title: 'Pierna', bodyPart: 'LEGS' });
  });
});

describe('RF-06 — UpdateWorkoutUseCase (Fluent Assertions)', () => {
  it('actualización falla (no encontrado tras existir) → NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(workout());
    vi.mocked(repo.update).mockResolvedValue(null);
    const useCase = new UpdateWorkoutUseCase(repo);

    try {
      await useCase.execute('workout-1', 'user-1', { title: 'Nuevo' } as any);
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError);
    }
  });
});

describe('RF-07 — DeleteWorkoutUseCase (Fluent Assertions)', () => {
  it('entrenamiento inexistente → NotFoundError sin llamar a delete', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    const useCase = new DeleteWorkoutUseCase(repo);

    try {
      await useCase.execute('workout-x', 'user-1');
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError);
      chaiExpect(repo.delete.mock.calls).to.have.lengthOf(0);
    }
  });
});

describe('RF-08 — CreateMealUseCase (Fluent Assertions)', () => {
  it('datos válidos → crea la comida asociada al usuario', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(meal());
    const useCase = new CreateMealUseCase(repo);

    const result = await useCase.execute('user-1', { name: 'Ensalada', calories: 400 } as any);

    chaiExpect(result.userId).to.equal('user-1');
    chaiExpect(repo.create.mock.calls[0][0]).to.include({ userId: 'user-1' });
  });
});

// ===================== Daniel Ortiz =====================

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
    userRepository = {
      findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(),
      findByResetToken: vi.fn(), findByEmailVerificationToken: vi.fn(), findAll: vi.fn(),
    };
  });

  it('correo no registrado → no revela nada y no lanza error', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    useCase = new ForgotPasswordUseCase(userRepository, {} as any);

    const result = await useCase.execute('nadie@test.com');

    chaiExpect(result).to.be.undefined;
    chaiExpect(userRepository.update).to.have.property('mock');
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
    const userRepository: IUserRepository = {
      findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(),
      findByResetToken: vi.fn(), findByEmailVerificationToken: vi.fn(), findAll: vi.fn(),
    };
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
    const userRepository: IUserRepository = {
      findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(),
      findByResetToken: vi.fn(), findByEmailVerificationToken: vi.fn(), findAll: vi.fn(),
    };
    vi.mocked(userRepository.findAll).mockResolvedValue([user({ id: 'u1' }), user({ id: 'u2', role: 'ADMIN' })]);
    const useCase = new GetAllUsersUseCase(userRepository);

    const result = await useCase.execute();

    chaiExpect(result).to.be.an('array').with.lengthOf(2);
    chaiExpect(result.every((u) => !('password' in u))).to.be.true;
  });
});

describe('RF-30 (parte 2) — ToggleUserBlockUseCase (Fluent Assertions)', () => {
  it('el admin intenta bloquear su propia cuenta → ForbiddenError', async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(),
      findByResetToken: vi.fn(), findByEmailVerificationToken: vi.fn(), findAll: vi.fn(),
    };
    const useCase = new ToggleUserBlockUseCase(userRepository);

    try {
      await useCase.execute('admin-1', 'admin-1');
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(ForbiddenError);
    }
  });

  it('usuario objetivo válido → invierte isBlocked', async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(),
      findByResetToken: vi.fn(), findByEmailVerificationToken: vi.fn(), findAll: vi.fn(),
    };
    vi.mocked(userRepository.findById).mockResolvedValue(user({ isBlocked: false }));
    vi.mocked(userRepository.update).mockResolvedValue(user({ isBlocked: true }));
    const useCase = new ToggleUserBlockUseCase(userRepository);

    const result = await useCase.execute('user-1', 'admin-1');

    chaiExpect(result.isBlocked).to.be.true;
  });
});
