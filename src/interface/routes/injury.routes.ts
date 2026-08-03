import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { container } from '../../infrastructure/container';
import { CreateInjurySchema, UpdateInjurySchema, QueryInjurySchema } from '../../application/dto/injury.dto';

const router = Router();
const { injuryController: controller } = container;

// Routes
router.post('/', authMiddleware, validate(CreateInjurySchema), (req, res, next) => controller.create(req, res, next));
router.get('/', authMiddleware, validate(QueryInjurySchema), (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));
router.put('/:id', authMiddleware, validate(UpdateInjurySchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => controller.delete(req, res, next));

export const injuryRouter = router;
