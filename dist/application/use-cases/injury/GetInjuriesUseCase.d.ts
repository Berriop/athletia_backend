import { IInjuryRepository } from '../../../domain/repositories/IInjuryRepository';
import { Injury } from '../../../domain/entities/Injury';
import { QueryInjuryDTO } from '../../dto/injury.dto';
export interface GetInjuriesResponse {
    data: Injury[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class GetInjuriesUseCase {
    private injuryRepository;
    constructor(injuryRepository: IInjuryRepository);
    execute(userId: string, queryParams: QueryInjuryDTO): Promise<GetInjuriesResponse>;
}
