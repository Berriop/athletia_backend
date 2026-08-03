import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { container } from '../../infrastructure/container';
import { CreateWorkoutSchema, UpdateWorkoutSchema, QueryWorkoutSchema } from '../../application/dto/workout.dto';

const router = Router();
const { workoutController: controller } = container;

// Routes
router.post('/', authMiddleware, validate(CreateWorkoutSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', authMiddleware, validate(QueryWorkoutSchema), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));
router.put('/:id', authMiddleware, validate(UpdateWorkoutSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => controller.delete(req, res, next));

export const workoutRouter = router;
