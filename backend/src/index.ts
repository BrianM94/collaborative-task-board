import 'reflect-metadata';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { Sequelize } from "sequelize-typescript";
import authRoutes from "./routes/authRoutes";
import { User } from "./models/User";
import { BoardColumn } from "./models/Column";
import { Task } from "./models/Task";
import columnRoutes from "./routes/columnRoutes";
import taskRoutes from "./routes/taskRoutes";
import { Dialect } from 'sequelize';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Inicializar Sequelize
export const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASS!, {
  dialect: process.env.DB_DIALECT as Dialect,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  models: [User, BoardColumn, Task],
  logging: console.log,
});

// Rutas
app.use("/auth", authRoutes);
app.use("/columns", columnRoutes);
app.use("/tasks", taskRoutes);

// Middleware de error
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
);

// Sincronizar modelos y arrancar servidor
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
  });
});
