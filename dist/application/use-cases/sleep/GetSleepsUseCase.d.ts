import { ISleepRepository } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { QuerySleepDTO } from '../../dto/sleep.dto';
export interface GetSleepsResponse {
    data: SleepLog[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class GetSleepsUseCase {
    private sleepRepository;
    constructor(sleepRepository: ISleepRepository);
    execute(userId: string, queryParams: QuerySleepDTO): Promise<GetSleepsResponse>;
}
