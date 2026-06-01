import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { InjuryController } from '../controllers/InjuryController';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { GetInjuriesUseCase } from '../../application/use-cases/injury/GetInjuriesUseCase';
import { GetInjuryByIdUseCase } from '../../application/use-cases/injury/GetInjuryByIdUseCase';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';
import { PrismaInjuryRepository } from '../../infrastructure/repositories/PrismaInjuryRepository';
import { CreateInjurySchema, UpdateInjurySchema, QueryInjurySchema } from '../../application/dto/injury.dto';

const router = Router();

// Dependency Injection
const repository = new PrismaInjuryRepository();
const createUseCase = new CreateInjuryUseCase(repository);
const getAllUseCase = new GetInjuriesUseCase(repository);
const getByIdUseCase = new GetInjuryByIdUseCase(repository);
const updateUseCase = new UpdateInjuryUseCase(repository);
const deleteUseCase = new DeleteInjuryUseCase(repository);
const controller = new InjuryController(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase);

// Routes — all protected with JWT
router.post('/', authMiddleware, validate(CreateInjurySchema), (req, res, next) => controller.create(req, res, next));
router.get('/', authMiddleware, validate(QueryInjurySchema), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));
router.put('/:id', authMiddleware, validate(UpdateInjurySchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => controller.delete(req, res, next));

export const injuryRouter = router;
