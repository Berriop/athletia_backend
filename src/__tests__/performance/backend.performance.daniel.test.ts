import { describe, it, expect, vi } from 'vitest';
import { GetAllUsersUseCase } from '../../application/use-cases/admin/GetAllUsersUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordSchema } from '../../application/dto/auth.dto';
import { CreateSleepSchema } from '../../application/dto/sleep.dto';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { elapsedMs, fakeUser, medianMs } from '../helpers/fixtures';

/**
 * Pruebas de rendimiento para las funcionalidades de backend de Daniel Ortiz:
 * RF-11 (registrar sueño), RF-27 (recuperar contraseña) y RF-30 (administrar
 * usuarios).
 *
 * Son pruebas no funcionales: además de comprobar que el resultado es correcto,
 * verifican un presupuesto de tiempo. Los límites son amplios a propósito para
 * evitar falsos fallos en equipos distintos (incluido Jenkins).
 */

describe('[Rendimiento] RF-30 — listado de usuarios para el administrador', () => {
  it('quita la contraseña de 10.000 usuarios dentro del presupuesto', async () => {
    const usuarios = Array.from({ length: 10_000 }, (_, i) => fakeUser({ id: `u${i}`, email: `u${i}@example.com` }));
    const repository = { findAll: vi.fn().mockResolvedValue(usuarios) } as unknown as IUserRepository;
    let resultado: Awaited<ReturnType<GetAllUsersUseCase['execute']>> = [];

    const duracion = await elapsedMs(async () => {
      resultado = await new GetAllUsersUseCase(repository).execute();
    });

    expect(resultado).toHaveLength(10_000);
    expect(resultado.every((usuario) => !('password' in usuario))).toBe(true);
    expect(duracion, `El listado tardó ${duracion.toFixed(1)} ms`).toBeLessThan(5_000);
  });

  it('el costo de listar crece de forma razonable al multiplicar por 10 los usuarios (mediana, margen amplio)', async () => {
    const crear = (cantidad: number) =>
      new GetAllUsersUseCase({
        findAll: vi.fn().mockResolvedValue(Array.from({ length: cantidad }, (_, i) => fakeUser({ id: `u${i}` }))),
      } as unknown as IUserRepository);
    const pequeno = crear(1000);
    const grande = crear(10_000);

    const medianaPequena = await medianMs(5, () => pequeno.execute());
    const medianaGrande = await medianMs(5, () => grande.execute());

    expect(medianaGrande).toBeLessThan(Math.max(medianaPequena * 100, 100));
  });
});

describe('[Rendimiento] RF-27 — recuperación de contraseña', () => {
  it('valida 2.000 restablecimientos de contraseña dentro del presupuesto', async () => {
    const payload = { body: { token: 'abc123', newPassword: 'NuevaClave@2026' } };
    let validas = 0;

    const duracion = await elapsedMs(() => {
      for (let i = 0; i < 2000; i++) {
        if (ResetPasswordSchema.safeParse(payload).success) validas++;
      }
    });

    expect(validas).toBe(2000);
    expect(duracion, `2.000 validaciones tardaron ${duracion.toFixed(1)} ms`).toBeLessThan(8_000);
  });

  it('genera 1.000 tokens de recuperación únicos dentro del presupuesto', async () => {
    const update = vi.fn().mockResolvedValue(fakeUser());
    const useCase = new ForgotPasswordUseCase(
      { findByEmail: vi.fn().mockResolvedValue(fakeUser()), update } as unknown as IUserRepository,
      { sendPasswordResetEmail: vi.fn(), sendVerificationEmail: vi.fn() },
    );

    const duracion = await elapsedMs(async () => {
      for (let i = 0; i < 1000; i++) await useCase.execute('user@example.com');
    });

    const tokens = new Set(update.mock.calls.map((llamada) => (llamada[1] as { resetPasswordToken: string }).resetPasswordToken));
    expect(tokens.size).toBe(1000);
    expect(duracion, `1.000 tokens tardaron ${duracion.toFixed(1)} ms`).toBeLessThan(8_000);
  });
});

describe('[Rendimiento] RF-11 — validación de registros de sueño', () => {
  it('valida 2.000 registros de sueño dentro del presupuesto', async () => {
    const payload = { body: { hoursSlept: 7.5, sleepQuality: 8, stressLevel: 3, date: '2026-08-01T00:00:00.000Z' } };
    let validos = 0;

    const duracion = await elapsedMs(() => {
      for (let i = 0; i < 2000; i++) {
        if (CreateSleepSchema.safeParse(payload).success) validos++;
      }
    });

    expect(validos).toBe(2000);
    expect(duracion, `2.000 validaciones tardaron ${duracion.toFixed(1)} ms`).toBeLessThan(8_000);
  });
});
