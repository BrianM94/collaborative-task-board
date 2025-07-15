import { Request, Response, NextFunction } from "express";
import { ColumnService } from "../services/columnService";

interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

export const createColumn = async (
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

    const { name, order } = req.body;
    if (!name || typeof order !== "number") {
      res.status(400).json({ message: "Nombre y orden requeridos" });
      return;
    }

    const column = await ColumnService.createColumn(name, order, userId);
    res.status(201).json(column);
  } catch (err) {
    next(err);
  }
};

export const getAllColumns = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return 
    }

    const columns = await ColumnService.getAllColumns(userId);
    res.json(columns);
  } catch (err) {
    next(err);
  }
};

export const getColumnById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return 
    }

    const id = Number(req.params.id);
    const column = await ColumnService.getColumnById(id, userId);

    if (!column) {
      res.status(404).json({ message: "Columna no encontrada" });
      return 
    }
    res.json(column);
  } catch (err) {
    next(err);
  }
};

export const updateColumn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return 
    }

    const id = Number(req.params.id);
    const { name } = req.body;
    const column = await ColumnService.updateColumn(id, userId, { name });

    if (!column) {
      res.status(404).json({ message: "Columna no encontrada" });
      return 
    }
    res.json(column);
  } catch (err) {
    next(err);
  }
};

export const reorderColumns = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return 
    }

    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      res.status(400).json({ message: "Se requiere un array de IDs ordenados." });
      return 
    }

    await ColumnService.reorderColumns(userId, orderedIds);
    res.status(200).json({ message: "Columnas reordenadas correctamente." });
  } catch (err) {
    next(err);
  }
};

export const deleteColumn = async (
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
    const deleted = await ColumnService.deleteColumn(id, userId);

    if (!deleted) {
      res.status(404).json({ message: "Columna no encontrada" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
