import { Meal, MealType } from '../entities/Meal';
import { ICrudRepository } from './ICrudRepository';

export interface MealFilters {
  mealType?: MealType;
  date?: Date;
}

export type IMealRepository = ICrudRepository<Meal, MealFilters>;
