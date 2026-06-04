import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { GymController } from '../controllers/GymController';
import { NearbyGymsUseCase } from '../../application/use-cases/gym/NearbyGymsUseCase';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
import { GoogleMapsGymService } from '../../infrastructure/services/GoogleMapsGymService';
import { NearbyGymsSchema, SearchGymsSchema } from '../../application/dto/gym.dto';

const router = Router();

const googleMapsService = new GoogleMapsGymService();
const nearbyUseCase = new NearbyGymsUseCase(googleMapsService);
const searchUseCase = new SearchGymsUseCase(googleMapsService);
const controller = new GymController(nearbyUseCase, searchUseCase);

router.get('/nearby', authMiddleware, validate(NearbyGymsSchema), (req, res, next) => controller.nearby(req, res, next));
router.get('/search', authMiddleware, validate(SearchGymsSchema), (req, res, next) => controller.search(req, res, next));

export const gymRouter = router;
