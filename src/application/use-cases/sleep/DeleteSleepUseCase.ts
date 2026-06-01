import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';

export class DeleteSleepUseCase {
  constructor(private sleepRepository: ISleepRepository) {}

  async execute(sleepId: string, userId: string): Promise<void> {
    const existing = await this.sleepRepository.findById(sleepId, userId);
    if (!existing) throw new Error('Sleep not found');

    const deleted = await this.sleepRepository.delete(sleepId, userId);
    if (!deleted) throw new Error('Failed to delete sleep');
  }
}
