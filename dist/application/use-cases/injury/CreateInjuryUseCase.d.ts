import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { CreateInjuryDTO } from '../../dto/injury.dto';
export declare class CreateInjuryUseCase {
    private injuryRepository;
    constructor(injuryRepository: IInjuryRepository);
    execute(userId: string, data: CreateInjuryDTO): Promise<Injury>;
}
