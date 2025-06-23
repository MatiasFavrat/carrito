import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import carritoRoutes from './routes/carrito.routes.js';
import paquetesRoutes from './routes/paquetes.routes.js';
import usersRoutes from './routes/users.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// Configuración de la base de datos
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../../Frontend')));
app.use(errorHandler);

//Rutas
app.use("/api/carrito", carritoRoutes);
app.use("/api/paquetes", paquetesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});