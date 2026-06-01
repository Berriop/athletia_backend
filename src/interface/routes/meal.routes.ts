import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { MealController } from '../controllers/MealController';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { GetMealsUseCase } from '../../application/use-cases/meal/GetMealsUseCase';
import { GetMealByIdUseCase } from '../../application/use-cases/meal/GetMealByIdUseCase';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';
import { PrismaMealRepository } from '../../infrastructure/repositories/PrismaMealRepository';
import { CreateMealSchema, UpdateMealSchema, QueryMealSchema } from '../../application/dto/meal.dto';

const router = Router();

// Dependency Injection
const repository = new PrismaMealRepository();
const createUseCase = new CreateMealUseCase(repository);
const getAllUseCase = new GetMealsUseCase(repository);
const getByIdUseCase = new GetMealByIdUseCase(repository);
const updateUseCase = new UpdateMealUseCase(repository);
const deleteUseCase = new DeleteMealUseCase(repository);
const controller = new MealController(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase);

// Routes — all protected with JWT
router.post('/', authMiddleware, validate(CreateMealSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', authMiddleware, validate(QueryMealSchema), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));
router.put('/:id', authMiddleware, validate(UpdateMealSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => controller.delete(req, res, next));

export const mealRouter = router;
