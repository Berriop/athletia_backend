import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';

const app: Application = express();

// Middlewares globales
app.use(express.json());
app.use(cors());

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Athletia API is running' });
});

// Aquí se integrarán las rutas de Interface > Routes en el futuro

// Inicialización del servidor
app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
