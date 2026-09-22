import { Workout } from '../../domain/entities/Workout';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { GetWorkoutsUseCase } from '../../application/use-cases/workout/GetWorkoutsUseCase';
import { GetWorkoutByIdUseCase } from '../../application/use-cases/workout/GetWorkoutByIdUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
import { CrudController } from './CrudController';

export class WorkoutController extends CrudController<Workout> {
  constructor(
    createUseCase: CreateWorkoutUseCase,
    getAllUseCase: GetWorkoutsUseCase,
    getByIdUseCase: GetWorkoutByIdUseCase,
    updateUseCase: UpdateWorkoutUseCase,
    deleteUseCase: DeleteWorkoutUseCase,
  ) {
    super(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase);
  }
}
