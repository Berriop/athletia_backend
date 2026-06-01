import { IMealRepository } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
import { UpdateMealDTO } from '../../dto/meal.dto';
export declare class UpdateMealUseCase {
    private mealRepository;
    constructor(mealRepository: IMealRepository);
    execute(mealId: string, userId: string, data: UpdateMealDTO): Promise<Meal>;
}
