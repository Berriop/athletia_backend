import { IMealRepository } from '../../../domain/repositories/IMealRepository';
export declare class DeleteMealUseCase {
    private mealRepository;
    constructor(mealRepository: IMealRepository);
    execute(mealId: string, userId: string): Promise<void>;
}
