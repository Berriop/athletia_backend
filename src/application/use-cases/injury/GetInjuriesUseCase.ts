import { IInjuryRepository, InjuryFilters } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { QueryInjuryDTO } from '../../dto/injury.dto';

export interface GetInjuriesResponse {
  data: Injury[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export class GetInjuriesUseCase {
  constructor(private injuryRepository: IInjuryRepository) {}

  async execute(userId: string, queryParams: QueryInjuryDTO): Promise<GetInjuriesResponse> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filters: InjuryFilters = {};
    if (queryParams.isActive !== undefined) filters.isActive = queryParams.isActive;
    if (queryParams.bodyArea) filters.bodyArea = queryParams.bodyArea;

    const [injuries, total] = await Promise.all([
      this.injuryRepository.findAll(userId, skip, limit, filters),
      this.injuryRepository.count(userId, filters),
    ]);

    return {
      data: injuries,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
