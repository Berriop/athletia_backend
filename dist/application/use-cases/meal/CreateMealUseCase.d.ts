import { IMealRepository } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
import { CreateMealDTO } from '../../dto/meal.dto';
export declare class CreateMealUseCase {
    private mealRepository;
    constructor(mealRepository: IMealRepository);
    execute(userId: string, data: CreateMealDTO): Promise<Meal>;
}
