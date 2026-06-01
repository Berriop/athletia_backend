import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { CreateWorkoutDTO } from '../../dto/workout.dto';
export declare class CreateWorkoutUseCase {
    private workoutRepository;
    constructor(workoutRepository: IWorkoutRepository);
    execute(userId: string, data: CreateWorkoutDTO): Promise<Workout>;
}
