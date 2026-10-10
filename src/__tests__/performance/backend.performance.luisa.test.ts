import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { RegisterSchema } from '../../application/dto/auth.dto';
import { ExportUserDataUseCase } from '../../application/use-cases/ExportUserDataUseCase';
import { JwtService } from '../../infrastructure/security/JwtService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { prisma } from '../../infrastructure/database/prisma';
import { elapsedMs, medianMs } from '../helpers/fixtures';

/**
 * Pruebas de rendimiento para las funcionalidades de backend de Luisa Espinal:
 * RF-01/RF-02 (validación y autenticación) y RF-29 (exportar historial de datos).
 *
 * Son pruebas no funcionales: además de comprobar que el resultado es correcto,
 * verifican un presupuesto de tiempo. Los límites son amplios a propósito para
 * evitar falsos fallos en equipos distintos (incluido Jenkins).
 */

vi.mock('../../infrastructure/database/prisma', () => ({
  prisma: {
    workout: { findMany: vi.fn() },
    meal: { findMany: vi.fn() },
    sleepLog: { findMany: vi.fn() },
    injury: { findMany: vi.fn() },
  },
}));

const STRONG_PASSWORD = 'StrongP@ss1234';

describe('[Rendimiento] RF-01 — validación del registro', () => {
  it('valida 2.000 solicitudes de registro dentro del presupuesto', async () => {
    const payload = { body: { email: 'rendimiento@example.com', password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD } };
    let validas = 0;

    const duracion = await elapsedMs(() => {
      for (let i = 0; i < 2000; i++) {
        if (RegisterSchema.safeParse(payload).success) validas++;
      }
    });

    expect(validas).toBe(2000);
    expect(duracion, `2.000 validaciones tardaron ${duracion.toFixed(1)} ms`).toBeLessThan(8_000);
  });
});

describe('[Rendimiento] RF-02 — emisión y verificación de tokens', () => {
  it('genera y verifica 500 tokens JWT dentro del presupuesto', async () => {
    const jwtService = new JwtService();
    let verificados = 0;

    const duracion = await elapsedMs(() => {
      for (let i = 0; i < 500; i++) {
        const token = jwtService.generateToken({ id: `user-${i}`, email: `u${i}@example.com`, role: 'USER' });
        if (jwtService.verifyToken(token).id === `user-${i}`) verificados++;
      }
    });

    expect(verificados).toBe(500);
    expect(duracion, `500 tokens tardaron ${duracion.toFixed(1)} ms`).toBeLessThan(8_000);
  });

  it('verificar un token es mucho más rápido que hashear una contraseña (el hash es lento a propósito)', async () => {
    const jwtService = new JwtService();
    const token = jwtService.generateToken({ id: 'u1', email: 'u1@example.com', role: 'USER' });

    const medianaToken = await medianMs(5, () => jwtService.verifyToken(token));
    const medianaHash = await medianMs(5, () => bcrypt.hash(STRONG_PASSWORD, 10));

    expect(medianaToken).toBeLessThan(medianaHash);
  });
});

describe('[Rendimiento] RF-29 — exportación de datos a CSV', () => {
  const FILAS_POR_TABLA = 5000;

  it('genera un CSV de 20.000 registros dentro del presupuesto y con todas las filas', async () => {
    const fecha = new Date('2026-08-01T12:00:00.000Z');
    vi.mocked(prisma.workout.findMany).mockResolvedValue(
      Array.from({ length: FILAS_POR_TABLA }, (_, i) => ({ title: `Rutina ${i}`, bodyPart: 'LEGS', durationMinutes: 45, date: fecha })) as never,
    );
    vi.mocked(prisma.meal.findMany).mockResolvedValue(
      Array.from({ length: FILAS_POR_TABLA }, (_, i) => ({ name: `Comida ${i}`, calories: 600, proteinG: 40, carbsG: 60, fatG: 15, date: fecha })) as never,
    );
    vi.mocked(prisma.sleepLog.findMany).mockResolvedValue(
      Array.from({ length: FILAS_POR_TABLA }, () => ({ hoursSlept: 7, sleepQuality: 8, stressLevel: 3, date: fecha })) as never,
    );
    vi.mocked(prisma.injury.findMany).mockResolvedValue(
      Array.from({ length: FILAS_POR_TABLA }, (_, i) => ({ bodyArea: 'Rodilla', injuryName: `Lesion ${i}`, severity: 4, createdAt: fecha })) as never,
    );
    const useCase = new ExportUserDataUseCase({} as IUserRepository);
    let csv = '';

    const duracion = await elapsedMs(async () => {
      csv = await useCase.execute('user-1');
    });

    expect(csv.split('\n')).toHaveLength(1 + FILAS_POR_TABLA * 4);
    expect(duracion, `La exportación tardó ${duracion.toFixed(1)} ms`).toBeLessThan(8_000);
  });
});
