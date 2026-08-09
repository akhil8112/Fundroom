import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('Error:', err);
  const isDev = process.env.NODE_ENV === 'development';

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: isDev ? err.message : undefined,
  });
};
