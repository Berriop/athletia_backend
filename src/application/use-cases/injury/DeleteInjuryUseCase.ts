import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { NotFoundError } from '../../../domain/errors/AppError';

export class DeleteInjuryUseCase {
  constructor(private readonly injuryRepository: IInjuryRepository) {}

  async execute(injuryId: string, userId: string): Promise<void> {
    const existing = await this.injuryRepository.findById(injuryId, userId);
    if (!existing) throw new NotFoundError('Lesión no encontrada');

    const deleted = await this.injuryRepository.delete(injuryId, userId);
    if (!deleted) throw new NotFoundError('Lesión no encontrada');
  }
}
