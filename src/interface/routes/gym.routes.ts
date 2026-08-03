import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { container } from '../../infrastructure/container';
import { NearbyGymsSchema, SearchGymsSchema } from '../../application/dto/gym.dto';

const router = Router();
const { gymController: controller } = container;

router.get('/nearby', authMiddleware, validate(NearbyGymsSchema), (req, res, next) => controller.nearby(req, res, next));
router.get('/search', authMiddleware, validate(SearchGymsSchema), (req, res, next) => controller.search(req, res, next));

export const gymRouter = router;
