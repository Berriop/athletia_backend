import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { WorkoutController } from '../controllers/WorkoutController';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { GetWorkoutsUseCase } from '../../application/use-cases/workout/GetWorkoutsUseCase';
import { GetWorkoutByIdUseCase } from '../../application/use-cases/workout/GetWorkoutByIdUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
import { PrismaWorkoutRepository } from '../../infrastructure/repositories/PrismaWorkoutRepository';
import { CreateWorkoutSchema, UpdateWorkoutSchema, QueryWorkoutSchema } from '../../application/dto/workout.dto';

const router = Router();

// Dependency Injection
const repository = new PrismaWorkoutRepository();
const createUseCase = new CreateWorkoutUseCase(repository);
const getAllUseCase = new GetWorkoutsUseCase(repository);
const getByIdUseCase = new GetWorkoutByIdUseCase(repository);
const updateUseCase = new UpdateWorkoutUseCase(repository);
const deleteUseCase = new DeleteWorkoutUseCase(repository);
const controller = new WorkoutController(createUseCase, getAllUseCase, getByIdUseCase, updateUseCase, deleteUseCase);

// Routes
router.post('/', authMiddleware, validate(CreateWorkoutSchema), (req, res) => controller.create(req, res));
router.get('/', authMiddleware, validate(QueryWorkoutSchema), (req, res) => controller.getAll(req, res));
router.get('/:id', authMiddleware, (req, res) => controller.getById(req, res));
router.put('/:id', authMiddleware, validate(UpdateWorkoutSchema), (req, res) => controller.update(req, res));
router.delete('/:id', authMiddleware, (req, res) => controller.delete(req, res));

export const workoutRouter = router;
