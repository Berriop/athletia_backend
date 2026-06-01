import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';

export class DeleteInjuryUseCase {
  constructor(private injuryRepository: IInjuryRepository) {}

  async execute(injuryId: string, userId: string): Promise<void> {
    const existing = await this.injuryRepository.findById(injuryId, userId);
    if (!existing) throw new Error('Injury not found');

    const deleted = await this.injuryRepository.delete(injuryId, userId);
    if (!deleted) throw new Error('Failed to delete injury');
  }
}
