import { Injury } from '../../domain/entities/Injury';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { GetInjuriesUseCase } from '../../application/use-cases/injury/GetInjuriesUseCase';
import { GetInjuryByIdUseCase } from '../../application/use-cases/injury/GetInjuryByIdUseCase';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';
import { CrudController } from './CrudController';

export class InjuryController extends CrudController<Injury> {
  constructor(
    createUseCase: CreateInjuryUseCase,
    getAllUseCase: GetInjuriesUseCase,
    getByIdUseCase: GetInjuryByIdUseCase,
    updateUseCase: UpdateInjuryUseCase,
    deleteUseCase: DeleteInjuryUseCase,
  ) {
    super(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase);
  }
}
