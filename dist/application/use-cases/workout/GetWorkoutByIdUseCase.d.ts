import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
export declare class GetWorkoutByIdUseCase {
    private workoutRepository;
    constructor(workoutRepository: IWorkoutRepository);
    execute(workoutId: string, userId: string): Promise<Workout>;
}
