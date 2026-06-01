import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { UpdateSleepDTO } from '../../dto/sleep.dto';

export class UpdateSleepUseCase {
  constructor(private sleepRepository: ISleepRepository) {}

  async execute(sleepId: string, userId: string, data: UpdateSleepDTO): Promise<SleepLog> {
    const existing = await this.sleepRepository.findById(sleepId, userId);
    if (!existing) throw new Error('Sleep not found');

    const updated = await this.sleepRepository.update(sleepId, userId, data);
    if (!updated) throw new Error('Failed to update sleep');
    return updated;
  }
}
