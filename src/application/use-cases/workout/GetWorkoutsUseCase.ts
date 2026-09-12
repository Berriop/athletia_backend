import { IWorkoutRepository, WorkoutFilters } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { QueryWorkoutDTO } from '../../dto/workout.dto';
import { resolvePagination, buildPaginatedResult, PaginatedResult } from '../pagination';

export type GetWorkoutsResponse = PaginatedResult<Workout>;

export class GetWorkoutsUseCase {
  constructor(private workoutRepository: IWorkoutRepository) {}

  async execute(userId: string, queryParams: QueryWorkoutDTO): Promise<GetWorkoutsResponse> {
    const { page, limit, skip } = resolvePagination(queryParams);

    const filters: WorkoutFilters = {};
    if (queryParams.bodyPart) filters.bodyPart = queryParams.bodyPart;
    if (queryParams.date) filters.date = new Date(queryParams.date);

    const [workouts, total] = await Promise.all([
      this.workoutRepository.findAll(userId, skip, limit, filters),
      this.workoutRepository.count(userId, filters),
    ]);

    return buildPaginatedResult(workouts, page, limit, total);
  }
}
