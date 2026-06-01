import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { CreateSleepDTO } from '../../dto/sleep.dto';

export class CreateSleepUseCase {
  constructor(private sleepRepository: ISleepRepository) {}

  async execute(userId: string, data: CreateSleepDTO): Promise<SleepLog> {
    const sleepData = {
      ...data,
      userId,
      notes: data.notes ?? null,
    };
    return this.sleepRepository.create(sleepData);
  }
}
