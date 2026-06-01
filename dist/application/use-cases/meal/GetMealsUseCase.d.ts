import { IMealRepository } from '../../../domain/repositories/IMealRepository';
import { Meal } from '../../../domain/entities/Meal';
import { QueryMealDTO } from '../../dto/meal.dto';
export interface GetMealsResponse {
    data: Meal[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class GetMealsUseCase {
    private mealRepository;
    constructor(mealRepository: IMealRepository);
    execute(userId: string, queryParams: QueryMealDTO): Promise<GetMealsResponse>;
}
