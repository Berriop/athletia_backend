import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { UpdateSleepDTO } from '../../dto/sleep.dto';
import { NotFoundError } from '../../../domain/errors/AppError';

export class UpdateSleepUseCase {
  constructor(private readonly sleepRepository: ISleepRepository) {}

  async execute(sleepId: string, userId: string, data: UpdateSleepDTO): Promise<SleepLog> {
    const existing = await this.sleepRepository.findById(sleepId, userId);
    if (!existing) throw new NotFoundError('Registro de sueño no encontrado');

    const updated = await this.sleepRepository.update(sleepId, userId, data);
    if (!updated) throw new NotFoundError('Registro de sueño no encontrado');
    return updated;
  }
}
