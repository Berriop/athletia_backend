import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { prisma } from '../../infrastructure/database/prisma';

export class ExportUserDataUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<string> {
    const [workouts, meals, sleepLogs, injuries] = await Promise.all([
      prisma.workout.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.meal.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.sleepLog.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.injury.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const rows: string[] = [];
    rows.push('TYPE,DATE,DETAIL_1,DETAIL_2,DETAIL_3');

    for (const w of workouts) {
      rows.push(`WORKOUT,${w.date.toISOString().split('T')[0]},"${w.title}","${w.bodyPart}","${w.durationMinutes} min"`);
    }

    for (const m of meals) {
      rows.push(`MEAL,${m.date.toISOString().split('T')[0]},"${m.name}","${m.calories} kcal","P:${m.proteinG}g C:${m.carbsG}g F:${m.fatG}g"`);
    }

    for (const s of sleepLogs) {
      rows.push(`SLEEP,${s.date.toISOString().split('T')[0]},"${s.hoursSlept} h","Calidad: ${s.sleepQuality}/10","Estrés: ${s.stressLevel}/10"`);
    }

    for (const i of injuries) {
      rows.push(`INJURY,${i.createdAt.toISOString().split('T')[0]},"${i.bodyArea}","${i.injuryName}","Severidad: ${i.severity}"`);
    }

    return rows.join('\n');
  }
}
