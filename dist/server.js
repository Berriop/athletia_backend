"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const auth_routes_1 = require("./interface/routes/auth.routes");
const workout_routes_1 = require("./interface/routes/workout.routes");
const meal_routes_1 = require("./interface/routes/meal.routes");
const sleep_routes_1 = require("./interface/routes/sleep.routes");
const injury_routes_1 = require("./interface/routes/injury.routes");
const error_middleware_1 = require("./interface/middlewares/error.middleware");
const app = (0, express_1.default)();
// Middlewares globales
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Healthcheck endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Athletia API is running' });
});
// Rutas API v1
const apiRouter = express_1.default.Router();
apiRouter.use('/auth', auth_routes_1.authRouter);
apiRouter.use('/workouts', workout_routes_1.workoutRouter);
apiRouter.use('/meals', meal_routes_1.mealRouter);
apiRouter.use('/sleeps', sleep_routes_1.sleepRouter);
apiRouter.use('/injuries', injury_routes_1.injuryRouter);
app.use('/api/v1', apiRouter);
// Manejo global de errores
app.use(error_middleware_1.errorHandler);
// Inicialización del servidor
app.listen(env_1.env.PORT, () => {
    console.log(`Server is running on port ${env_1.env.PORT}`);
});
