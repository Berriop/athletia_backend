import { IInjuryRepository, InjuryFilters } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { QueryInjuryDTO } from '../../dto/injury.dto';
import { resolvePagination, buildPaginatedResult, PaginatedResult } from '../pagination';

export type GetInjuriesResponse = PaginatedResult<Injury>;

export class GetInjuriesUseCase {
  constructor(private injuryRepository: IInjuryRepository) {}

  async execute(userId: string, queryParams: QueryInjuryDTO): Promise<GetInjuriesResponse> {
    const { page, limit, skip } = resolvePagination(queryParams);

    const filters: InjuryFilters = {};
    if (queryParams.isActive !== undefined) filters.isActive = queryParams.isActive;
    if (queryParams.bodyArea) filters.bodyArea = queryParams.bodyArea;

    const [injuries, total] = await Promise.all([
      this.injuryRepository.findAll(userId, skip, limit, filters),
      this.injuryRepository.count(userId, filters),
    ]);

    return buildPaginatedResult(injuries, page, limit, total);
  }
}
