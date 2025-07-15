import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/apiTypes';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: [{ field: 'general', message: error.message }]
    });
    return;
  }

  if (error.name === 'NotFoundError') {
    res.status(404).json({
      success: false,
      message: `Ruta ${req.originalUrl} no encontrada`
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
};