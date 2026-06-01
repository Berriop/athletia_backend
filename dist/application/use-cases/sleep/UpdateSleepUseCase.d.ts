import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { UpdateSleepDTO } from '../../dto/sleep.dto';
export declare class UpdateSleepUseCase {
    private sleepRepository;
    constructor(sleepRepository: ISleepRepository);
    execute(sleepId: string, userId: string, data: UpdateSleepDTO): Promise<SleepLog>;
}
