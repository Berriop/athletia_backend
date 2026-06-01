import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { SleepController } from '../controllers/SleepController';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { GetSleepsUseCase } from '../../application/use-cases/sleep/GetSleepsUseCase';
import { GetSleepByIdUseCase } from '../../application/use-cases/sleep/GetSleepByIdUseCase';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
import { PrismaSleepRepository } from '../../infrastructure/repositories/PrismaSleepRepository';
import { CreateSleepSchema, UpdateSleepSchema, QuerySleepSchema } from '../../application/dto/sleep.dto';

const router = Router();

// Dependency Injection
const repository = new PrismaSleepRepository();
const createUseCase = new CreateSleepUseCase(repository);
const getAllUseCase = new GetSleepsUseCase(repository);
const getByIdUseCase = new GetSleepByIdUseCase(repository);
const updateUseCase = new UpdateSleepUseCase(repository);
const deleteUseCase = new DeleteSleepUseCase(repository);
const controller = new SleepController(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase);

// Routes — all protected with JWT
router.post('/', authMiddleware, validate(CreateSleepSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', authMiddleware, validate(QuerySleepSchema), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));
router.put('/:id', authMiddleware, validate(UpdateSleepSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => controller.delete(req, res, next));

export const sleepRouter = router;
