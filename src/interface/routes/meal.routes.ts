import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { container } from '../../infrastructure/container';
import { CreateMealSchema, UpdateMealSchema, QueryMealSchema } from '../../application/dto/meal.dto';

const router = Router();
const { mealController: controller } = container;

// Routes
router.post('/', authMiddleware, validate(CreateMealSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', authMiddleware, validate(QueryMealSchema), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));
router.put('/:id', authMiddleware, validate(UpdateMealSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => controller.delete(req, res, next));

export const mealRouter = router;
