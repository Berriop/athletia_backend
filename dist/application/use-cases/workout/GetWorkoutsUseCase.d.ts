import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { QueryWorkoutDTO } from '../../dto/workout.dto';
export interface GetWorkoutsResponse {
    data: Workout[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class GetWorkoutsUseCase {
    private workoutRepository;
    constructor(workoutRepository: IWorkoutRepository);
    execute(userId: string, queryParams: QueryWorkoutDTO): Promise<GetWorkoutsResponse>;
}
