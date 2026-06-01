import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './interface/routes/auth.routes';
import { workoutRouter } from './interface/routes/workout.routes';
import { mealRouter } from './interface/routes/meal.routes';
import { errorHandler } from './interface/middlewares/error.middleware';

const app: Application = express();

// Middlewares globales
app.use(express.json());
app.use(cors());

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Athletia API is running' });
});

// Rutas API v1
const apiRouter = express.Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/workouts', workoutRouter);
apiRouter.use('/meals', mealRouter);

app.use('/api/v1', apiRouter);

// Manejo global de errores
app.use(errorHandler);

// Inicialización del servidor
app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
