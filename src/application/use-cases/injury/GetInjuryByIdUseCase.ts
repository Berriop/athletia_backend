import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';

export class GetInjuryByIdUseCase {
  constructor(private injuryRepository: IInjuryRepository) {}

  async execute(injuryId: string, userId: string): Promise<Injury> {
    const injury = await this.injuryRepository.findById(injuryId, userId);
    if (!injury) throw new Error('Injury not found');
    return injury;
  }
}
