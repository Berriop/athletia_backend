import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { NotFoundError } from '../../../domain/errors/AppError';

export class GetInjuryByIdUseCase {
  constructor(private injuryRepository: IInjuryRepository) {}

  async execute(injuryId: string, userId: string): Promise<Injury> {
    const injury = await this.injuryRepository.findById(injuryId, userId);
    if (!injury) throw new NotFoundError('Injury not found');
    return injury;
  }
}
