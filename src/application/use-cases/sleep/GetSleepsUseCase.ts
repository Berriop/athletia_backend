import { ISleepRepository, SleepFilters } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { QuerySleepDTO } from '../../dto/sleep.dto';

export interface GetSleepsResponse {
  data: SleepLog[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export class GetSleepsUseCase {
  constructor(private sleepRepository: ISleepRepository) {}

  async execute(userId: string, queryParams: QuerySleepDTO): Promise<GetSleepsResponse> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filters: SleepFilters = {};
    if (queryParams.date) filters.date = new Date(queryParams.date);

    const [sleeps, total] = await Promise.all([
      this.sleepRepository.findAll(userId, skip, limit, filters),
      this.sleepRepository.count(userId, filters),
    ]);

    return {
      data: sleeps,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
