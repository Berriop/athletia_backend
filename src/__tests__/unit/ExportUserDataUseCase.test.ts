import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportUserDataUseCase } from '../../application/use-cases/ExportUserDataUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

// RF-34 — Exportar historial. Basado en el diagrama "RF-34 Back
// (ExportUserDataUseCase)" (Patrón B, V(G)=1, 1 camino básico: función
// lineal, sin decisiones).
//
// Esta función no pasa por un repositorio propio: consulta `prisma`
// directamente (ver hallazgo de arquitectura en el análisis del proyecto),
// así que aquí se mockea el módulo de conexión a la base de datos.
vi.mock('../../infrastructure/database/prisma', () => ({
  prisma: {
    workout: { findMany: vi.fn() },
    meal: { findMany: vi.fn() },
    sleepLog: { findMany: vi.fn() },
    injury: { findMany: vi.fn() },
  },
}));

import { prisma } from '../../infrastructure/database/prisma';

describe('ExportUserDataUseCase', () => {
  let userRepository: IUserRepository;
  let useCase: ExportUserDataUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findByResetToken: vi.fn(),
      findByEmailVerificationToken: vi.fn(),
      findAll: vi.fn(),
    };
    useCase = new ExportUserDataUseCase(userRepository);
  });

  // Camino único: INICIO,1,2,3,FIN
  it('Camino 1: consulta en paralelo los 4 tipos de registro y arma un CSV con una fila por registro', async () => {
    vi.mocked(prisma.workout.findMany).mockResolvedValue([
      { title: 'Pierna', bodyPart: 'LEGS', durationMinutes: 45, date: new Date('2026-08-01') } as any,
    ]);
    vi.mocked(prisma.meal.findMany).mockResolvedValue([
      { name: 'Ensalada', calories: 400, proteinG: 20, carbsG: 30, fatG: 10, date: new Date('2026-08-02') } as any,
    ]);
    vi.mocked(prisma.sleepLog.findMany).mockResolvedValue([
      { hoursSlept: 7, sleepQuality: 8, stressLevel: 3, date: new Date('2026-08-03') } as any,
    ]);
    vi.mocked(prisma.injury.findMany).mockResolvedValue([
      { bodyArea: 'Hombro', injuryName: 'Tendinitis', severity: 4, createdAt: new Date('2026-08-04') } as any,
    ]);

    const csv = await useCase.execute('user-1');
    const lines = csv.split('\n');

    expect(prisma.workout.findMany).toHaveBeenCalledWith({ where: { userId: 'user-1' }, orderBy: { date: 'desc' } });
    expect(lines[0]).toBe('TYPE,DATE,DETAIL_1,DETAIL_2,DETAIL_3');
    expect(lines).toHaveLength(5); // encabezado + 1 fila por cada tipo de registro
    expect(lines.find((l) => l.startsWith('WORKOUT'))).toContain('2026-08-01');
    expect(lines.find((l) => l.startsWith('MEAL'))).toContain('Ensalada');
    expect(lines.find((l) => l.startsWith('SLEEP'))).toContain('Calidad: 8/10');
    expect(lines.find((l) => l.startsWith('INJURY'))).toContain('Tendinitis');
  });

  it('sin ningún registro → retorna solo el encabezado del CSV', async () => {
    vi.mocked(prisma.workout.findMany).mockResolvedValue([]);
    vi.mocked(prisma.meal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.sleepLog.findMany).mockResolvedValue([]);
    vi.mocked(prisma.injury.findMany).mockResolvedValue([]);

    const csv = await useCase.execute('user-1');

    expect(csv).toBe('TYPE,DATE,DETAIL_1,DETAIL_2,DETAIL_3');
  });
});
