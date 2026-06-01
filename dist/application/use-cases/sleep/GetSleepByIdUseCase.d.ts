import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
export declare class GetSleepByIdUseCase {
    private sleepRepository;
    constructor(sleepRepository: ISleepRepository);
    execute(sleepId: string, userId: string): Promise<SleepLog>;
}
