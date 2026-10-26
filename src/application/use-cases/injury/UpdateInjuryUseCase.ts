import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { UpdateInjuryDTO } from '../../dto/injury.dto';
import { NotFoundError } from '../../../domain/errors/AppError';

export class UpdateInjuryUseCase {
  constructor(private readonly injuryRepository: IInjuryRepository) {}

  async execute(injuryId: string, userId: string, data: UpdateInjuryDTO): Promise<Injury> {
    const existing = await this.injuryRepository.findById(injuryId, userId);
    if (!existing) throw new NotFoundError('Lesión no encontrada');

    const updated = await this.injuryRepository.update(injuryId, userId, data);
    if (!updated) throw new NotFoundError('Lesión no encontrada');
    return updated;
  }
}
