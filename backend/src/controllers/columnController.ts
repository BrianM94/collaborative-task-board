import { Request, Response, NextFunction } from "express";
import { ColumnService } from "../services/columnService";
import { BoardColumn } from "../models/Column";

export const createColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, order }: { name: string; order: number } = req.body;
    if (!name || typeof order !== "number") {
      res.status(400).json({ message: "Nombre y orden requeridos" });
      return;
    }
    const column: BoardColumn = await ColumnService.createColumn(name, order);
    res.status(201).json(column);
  } catch (err) {
    next(err);
  }
};

export const getAllColumns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const columns: BoardColumn[] = await ColumnService.getAllColumns();
    res.json(columns);
  } catch (err) {
    next(err);
  }
};

export const getColumnById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id: number = Number(req.params.id);
    const column: BoardColumn | null = await ColumnService.getColumnById(id);
    if (!column) {
      res.status(404).json({ message: "Columna no encontrada" });
      return;
    }
    res.json(column);
  } catch (err) {
    next(err);
  }
};

export const updateColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id: number = Number(req.params.id);
    const data = req.body;
    const column: BoardColumn | null = await ColumnService.updateColumn(id, data);
    if (!column) {
      res.status(404).json({ message: "Columna no encontrada" });
      return;
    }
    res.json(column);
  } catch (err) {
    next(err);
  }
};

export const reorderColumns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderedIds }: { orderedIds: number[] } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      res.status(400).json({ message: "Se requiere un array de IDs ordenados." });
      return; 
    }

    await ColumnService.reorderColumns(orderedIds);

    res.status(200).json({ message: "Columnas reordenadas correctamente." });
  } catch (err) {
    next(err);
  }
};

export const deleteColumn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const deleted = await ColumnService.deleteColumn(id);
    if (!deleted) {
      res.status(404).json({ message: "Columna no encontrada" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
