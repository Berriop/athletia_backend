import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { NotFoundError } from '../../../domain/errors/AppError';

export class GetSleepByIdUseCase {
  constructor(private sleepRepository: ISleepRepository) {}

  async execute(sleepId: string, userId: string): Promise<SleepLog> {
    const sleep = await this.sleepRepository.findById(sleepId, userId);
    if (!sleep) throw new NotFoundError('Sleep log not found');
    return sleep;
  }
}
