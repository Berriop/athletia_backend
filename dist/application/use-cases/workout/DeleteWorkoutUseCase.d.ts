import { IWorkoutRepository } from '../../../domain/repositories/IWorkoutRepository';
export declare class DeleteWorkoutUseCase {
    private workoutRepository;
    constructor(workoutRepository: IWorkoutRepository);
    execute(workoutId: string, userId: string): Promise<void>;
}
