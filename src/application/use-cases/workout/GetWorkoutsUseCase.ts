import { IWorkoutRepository, WorkoutFilters } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { QueryWorkoutDTO } from '../../dto/workout.dto';

export interface GetWorkoutsResponse {
  data: Workout[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export class GetWorkoutsUseCase {
  constructor(private workoutRepository: IWorkoutRepository) {}

  async execute(userId: string, queryParams: QueryWorkoutDTO): Promise<GetWorkoutsResponse> {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    const filters: WorkoutFilters = {};
    if (queryParams.bodyPart) filters.bodyPart = queryParams.bodyPart;
    if (queryParams.date) filters.date = new Date(queryParams.date);

    const [workouts, total] = await Promise.all([
      this.workoutRepository.findAll(userId, skip, limit, filters),
      this.workoutRepository.count(userId, filters),
    ]);

    return {
      data: workouts,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
