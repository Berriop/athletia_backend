import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { authRouter } from './interface/routes/auth.routes';
import { workoutRouter } from './interface/routes/workout.routes';
import { mealRouter } from './interface/routes/meal.routes';
import { sleepRouter } from './interface/routes/sleep.routes';
import { injuryRouter } from './interface/routes/injury.routes';
import { gymRouter } from './interface/routes/gym.routes';
import { adminRouter } from './interface/routes/admin.routes';
import { errorHandler } from './interface/middlewares/error.middleware';
import { ForbiddenError } from './domain/errors/AppError';

const app: Application = express();

// 1. Helmet security headers
app.use(helmet());

// 2. Strict CORS configuration
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new ForbiddenError('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// 3. Body parser
app.use(express.json());

// 4. Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts. Please try again after 15 minutes',
    },
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many accounts created from this IP. Please try again after an hour',
    },
  },
});

app.use('/api/', globalLimiter);
app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/v1/auth/register', registerLimiter);

// Healthcheck endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Athletia API is running' });
});

// Rutas API v1
const apiRouter = express.Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/workouts', workoutRouter);
apiRouter.use('/meals', mealRouter);
apiRouter.use('/sleeps', sleepRouter);
apiRouter.use('/injuries', injuryRouter);
apiRouter.use('/gyms', gymRouter);
apiRouter.use('/admin', adminRouter);

app.use('/api/v1', apiRouter);

// Manejo global de errores
app.use(errorHandler);

// Inicialización del servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

export { app };
