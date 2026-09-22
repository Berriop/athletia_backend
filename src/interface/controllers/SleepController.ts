import { SleepLog } from '../../domain/entities/SleepLog';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { GetSleepsUseCase } from '../../application/use-cases/sleep/GetSleepsUseCase';
import { GetSleepByIdUseCase } from '../../application/use-cases/sleep/GetSleepByIdUseCase';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
import { CrudController } from './CrudController';

export class SleepController extends CrudController<SleepLog> {
  constructor(
    createUseCase: CreateSleepUseCase,
    getAllUseCase: GetSleepsUseCase,
    getByIdUseCase: GetSleepByIdUseCase,
    updateUseCase: UpdateSleepUseCase,
    deleteUseCase: DeleteSleepUseCase,
  ) {
    super(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase);
  }
}
