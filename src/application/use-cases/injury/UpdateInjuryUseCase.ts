import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { UpdateInjuryDTO } from '../../dto/injury.dto';

export class UpdateInjuryUseCase {
  constructor(private injuryRepository: IInjuryRepository) {}

  async execute(injuryId: string, userId: string, data: UpdateInjuryDTO): Promise<Injury> {
    const existing = await this.injuryRepository.findById(injuryId, userId);
    if (!existing) throw new Error('Injury not found');

    const updated = await this.injuryRepository.update(injuryId, userId, data);
    if (!updated) throw new Error('Failed to update injury');
    return updated;
  }
}
