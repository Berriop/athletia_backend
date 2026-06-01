import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';

export class GetSleepByIdUseCase {
  constructor(private sleepRepository: ISleepRepository) {}

  async execute(sleepId: string, userId: string): Promise<SleepLog> {
    const sleep = await this.sleepRepository.findById(sleepId, userId);
    if (!sleep) throw new Error('Sleep not found');
    return sleep;
  }
}
