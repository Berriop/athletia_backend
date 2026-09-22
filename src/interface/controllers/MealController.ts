import { Meal } from '../../domain/entities/Meal';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { GetMealsUseCase } from '../../application/use-cases/meal/GetMealsUseCase';
import { GetMealByIdUseCase } from '../../application/use-cases/meal/GetMealByIdUseCase';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';
import { CrudController } from './CrudController';

export class MealController extends CrudController<Meal> {
  constructor(
    createUseCase: CreateMealUseCase,
    getAllUseCase: GetMealsUseCase,
    getByIdUseCase: GetMealByIdUseCase,
    updateUseCase: UpdateMealUseCase,
    deleteUseCase: DeleteMealUseCase,
  ) {
    super(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase);
  }
}
