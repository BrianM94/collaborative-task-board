import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/taskService";
interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { title, description, priority, status, order, columnId } = req.body;
    if (!title || !priority || !status || typeof order !== "number" || !columnId) {
      res.status(400).json({ message: "Campos requeridos faltantes" });
      return;
    }

    const task = await TaskService.createTask(req.body, userId);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const getAllTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { status, priority } = req.query;
    const tasks = await TaskService.getAllTasks(userId, {
      status: status as string | undefined,
      priority: priority as string | undefined,
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const id = Number(req.params.id);
    const task = await TaskService.getTaskById(id, userId);

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const id = Number(req.params.id);
    const task = await TaskService.updateTask(id, userId, req.body);

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const id = Number(req.params.id);
    const deleted = await TaskService.deleteTask(id, userId);

    if (!deleted) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const reorderTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { tasks } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      res.status(400).json({ message: "Se requiere un array de tareas." });
      return;
    }

    await TaskService.updateTaskOrder(userId, tasks);
    res.status(200).json({ message: "Tareas reordenadas correctamente." });
  } catch (err) {
    next(err);
  }
};

export const moveTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const id = Number(req.params.id);
    const { newColumnId, newOrder } = req.body;
    if (!newColumnId || typeof newOrder !== "number") {
      res.status(400).json({ message: "Datos de movimiento inválidos" });
      return;
    }

    const task = await TaskService.moveTask(id, userId, newColumnId, newOrder);
    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};
