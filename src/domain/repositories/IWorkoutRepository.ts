import { Workout, BodyPart } from '../entities/Workout';
import { ICrudRepository } from './ICrudRepository';

export interface WorkoutFilters {
  bodyPart?: BodyPart;
  date?: Date;
}

export type IWorkoutRepository = ICrudRepository<Workout, WorkoutFilters>;
