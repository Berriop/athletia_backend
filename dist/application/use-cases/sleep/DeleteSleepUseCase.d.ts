import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
export declare class DeleteSleepUseCase {
    private sleepRepository;
    constructor(sleepRepository: ISleepRepository);
    execute(sleepId: string, userId: string): Promise<void>;
}
