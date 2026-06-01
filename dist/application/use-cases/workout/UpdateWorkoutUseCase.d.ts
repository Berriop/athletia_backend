import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../../domain/entities/Workout';
import { UpdateWorkoutDTO } from '../../dto/workout.dto';
export declare class UpdateWorkoutUseCase {
    private workoutRepository;
    constructor(workoutRepository: IWorkoutRepository);
    execute(workoutId: string, userId: string, data: UpdateWorkoutDTO): Promise<Workout>;
}
