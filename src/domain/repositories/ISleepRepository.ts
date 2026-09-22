import { SleepLog } from '../entities/SleepLog';
import { ICrudRepository } from './ICrudRepository';

export interface SleepFilters {
  date?: Date;
}

export type ISleepRepository = ICrudRepository<SleepLog, SleepFilters>;
