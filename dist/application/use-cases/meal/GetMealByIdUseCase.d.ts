import { IMealRepository } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
export declare class GetMealByIdUseCase {
    private mealRepository;
    constructor(mealRepository: IMealRepository);
    execute(mealId: string, userId: string): Promise<Meal>;
}
