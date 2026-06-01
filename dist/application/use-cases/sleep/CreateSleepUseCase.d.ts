import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { CreateSleepDTO } from '../../dto/sleep.dto';
export declare class CreateSleepUseCase {
    private sleepRepository;
    constructor(sleepRepository: ISleepRepository);
    execute(userId: string, data: CreateSleepDTO): Promise<SleepLog>;
}
