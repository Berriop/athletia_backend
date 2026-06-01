import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { UpdateInjuryDTO } from '../../dto/injury.dto';
export declare class UpdateInjuryUseCase {
    private injuryRepository;
    constructor(injuryRepository: IInjuryRepository);
    execute(injuryId: string, userId: string, data: UpdateInjuryDTO): Promise<Injury>;
}
