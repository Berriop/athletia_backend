import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
export declare class GetInjuryByIdUseCase {
    private injuryRepository;
    constructor(injuryRepository: IInjuryRepository);
    execute(injuryId: string, userId: string): Promise<Injury>;
}
