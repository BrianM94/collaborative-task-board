import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/taskService";
import { Task } from "../models/Task";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, priority, status, order, columnId } = req.body;
    if (
      !title ||
      !priority ||
      !status ||
      typeof order !== "number" ||
      !columnId
    ) {
      res.status(400).json({ message: "Campos requeridos faltantes" });
      return;
    }
    const task = await TaskService.createTask({
      title,
      description,
      priority,
      status,
      order,
      columnId,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, priority } = req.query;
    const tasks = await TaskService.getAllTasks({
      status: status as string | undefined,
      priority: priority as string | undefined,
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const task = await TaskService.getTaskById(id);
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id: number = Number(req.params.id);
    const data: Partial<Omit<Task, "id">> = req.body;
    const task: Task | null = await TaskService.updateTask(id, data);

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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await TaskService.deleteTask(id);
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tasks }: { tasks: { id: number; order: number; columnId: number }[] } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      res.status(400).json({ message: "Se requiere un array de tareas." });
      return; 
    }

    await TaskService.updateTaskOrder(tasks);

    res.status(200).json({ message: "Tareas reordenadas correctamente." });
  } catch (err) {
    next(err);
  }
};

export const moveTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { newColumnId, newOrder } = req.body;
    if (!newColumnId || typeof newOrder !== "number") {
      res.status(400).json({ message: "Datos de movimiento inválidos" });
      return;
    }
    const task = await TaskService.moveTask(id, newColumnId, newOrder);
    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};
