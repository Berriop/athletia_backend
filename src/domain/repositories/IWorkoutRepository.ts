import { Workout } from '../entities/Workout';

export interface WorkoutFilters {
  bodyPart?: string;
  date?: Date;
}

export interface IWorkoutRepository {
  create(data: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout>;
  findById(id: string, userId: string): Promise<Workout | null>;
  findAll(userId: string, skip: number, take: number, filters?: WorkoutFilters): Promise<Workout[]>;
  update(id: string, userId: string, data: Partial<Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Workout | null>;
  delete(id: string, userId: string): Promise<boolean>;
  count(userId: string, filters?: WorkoutFilters): Promise<number>;
}
