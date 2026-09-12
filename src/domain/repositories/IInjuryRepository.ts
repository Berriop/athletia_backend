import { Injury } from '../entities/Injury';
import { ICrudRepository } from './ICrudRepository';

export interface InjuryFilters {
  isActive?: boolean;
  bodyArea?: string;
}

export type IInjuryRepository = ICrudRepository<Injury, InjuryFilters>;
