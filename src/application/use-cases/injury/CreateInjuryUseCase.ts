import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { CreateInjuryDTO } from '../../dto/injury.dto';

export class CreateInjuryUseCase {
  constructor(private injuryRepository: IInjuryRepository) {}

  async execute(userId: string, data: CreateInjuryDTO): Promise<Injury> {
    const injuryData = {
      ...data,
      userId,
      notes: data.notes ?? null,
    };
    return this.injuryRepository.create(injuryData);
  }
}
