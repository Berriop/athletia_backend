import { ISleepRepository, SleepFilters } from '../../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../../domain/entities/SleepLog';
import { QuerySleepDTO } from '../../dto/sleep.dto';
import { resolvePagination, buildPaginatedResult, PaginatedResult } from '../pagination';

export type GetSleepsResponse = PaginatedResult<SleepLog>;

export class GetSleepsUseCase {
  constructor(private sleepRepository: ISleepRepository) {}

  async execute(userId: string, queryParams: QuerySleepDTO): Promise<GetSleepsResponse> {
    const { page, limit, skip } = resolvePagination(queryParams);

    const filters: SleepFilters = {};
    if (queryParams.date) filters.date = new Date(queryParams.date);

    const [sleeps, total] = await Promise.all([
      this.sleepRepository.findAll(userId, skip, limit, filters),
      this.sleepRepository.count(userId, filters),
    ]);

    return buildPaginatedResult(sleeps, page, limit, total);
  }
}
