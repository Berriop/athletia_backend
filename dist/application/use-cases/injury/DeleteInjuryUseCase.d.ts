import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
export declare class DeleteInjuryUseCase {
    private injuryRepository;
    constructor(injuryRepository: IInjuryRepository);
    execute(injuryId: string, userId: string): Promise<void>;
}
