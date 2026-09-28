import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { GetAllUsersUseCase } from '../../application/use-cases/admin/GetAllUsersUseCase';
import { ToggleUserBlockUseCase } from '../../application/use-cases/admin/ToggleUserBlockUseCase';
import { NotFoundError, ForbiddenError } from '../../domain/errors/AppError';
import { Meal } from '../../domain/entities/Meal';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';

/**
 * Suite de REGRESIÓN para las funcionalidades de backend de Daniel Ortiz:
 * RF-09, RF-10, RF-11, RF-27, RF-30.
 */

function genericRepo<T>() {
  return { create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() } as any as T & Record<string, ReturnType<typeof vi.fn>>;
}
function meal(overrides: Partial<Meal> = {}): Meal {
  return { id: 'meal-1', name: 'Ensalada', calories: 400, mealType: 'LUNCH', proteinG: 20, carbsG: 30, fatG: 10, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function user(overrides: Partial<User> = {}): User {
  return { id: 'user-1', email: 'user@test.com', password: 'hashed', name: 'Jane', birthDate: null, gender: null, heightCm: null, weightKg: null, experienceLevel: null, role: 'USER', isEmailVerified: false, emailVerificationToken: null, resetPasswordToken: 'reset-token', resetPasswordExpires: new Date(Date.now() + 15 * 60_000), isBlocked: false, createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function makeUserRepository(): IUserRepository {
  return { findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(), findByResetToken: vi.fn(), findByEmailVerificationToken: vi.fn(), findAll: vi.fn() };
}

describe('[Regresión] RF-09/10 — Meal: modificar/eliminar siguen validando propiedad', () => {
  it('modificar una comida válida y propia sigue retornando la comida actualizada', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(meal());
    vi.mocked(repo.update).mockResolvedValue(meal({ calories: 999 }));
    const result = await new UpdateMealUseCase(repo).execute('meal-1', 'user-1', { calories: 999 } as any);
    expect(result.calories).toBe(999);
  });

  it('eliminar una comida cuya eliminación falla sigue lanzando NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(meal());
    vi.mocked(repo.delete).mockResolvedValue(false);
    await expect(new DeleteMealUseCase(repo).execute('meal-1', 'user-1')).rejects.toThrow(NotFoundError);
  });
});

describe('[Regresión] RF-11 — CreateSleepUseCase sigue asociando el registro al usuario', () => {
  it('sigue normalizando notes a null cuando no se envía', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue({ id: 'sleep-1' } as any);
    await new CreateSleepUseCase(repo).execute('user-1', { hoursSlept: 7, sleepQuality: 8, stressLevel: 3 } as any);
    expect(repo.create.mock.calls[0][0]).toMatchObject({ userId: 'user-1', notes: null });
  });
});

describe('[Regresión] RF-27 — Recuperar contraseña sigue sin revelar si el correo existe', () => {
  it('correo no registrado sigue sin lanzar error ni actualizar nada', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    await expect(new ForgotPasswordUseCase(userRepository, {} as any).execute('nadie@test.com')).resolves.toBeUndefined();
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('token vencido o inválido sigue rechazando el restablecimiento', async () => {
    const userRepository = makeUserRepository();
    const hashService: IHashService = { hash: vi.fn(), compare: vi.fn() };
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(null);
    await expect(new ResetPasswordUseCase(userRepository, hashService).execute('token-x', 'nueva')).rejects.toThrow();
  });
});

describe('[Regresión] RF-30 — Gestión de usuarios sigue protegiendo al admin de auto-bloquearse', () => {
  beforeEach(() => vi.clearAllMocks());

  it('un admin sigue sin poder bloquear su propia cuenta', async () => {
    const userRepository = makeUserRepository();
    await expect(new ToggleUserBlockUseCase(userRepository).execute('admin-1', 'admin-1')).rejects.toThrow(ForbiddenError);
  });

  it('listar usuarios sigue ocultando la contraseña de cada uno', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.findAll).mockResolvedValue([user()]);
    const result = await new GetAllUsersUseCase(userRepository).execute();
    expect(result[0]).not.toHaveProperty('password');
  });
});
