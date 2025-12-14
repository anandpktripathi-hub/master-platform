import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.config';

type HttpErrorLike = {
  status?: number;
  statusCode?: number;
  message?: string;
  stack?: string;
};

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  void _next; // required for Express error middleware signature
  const error = err as HttpErrorLike;
  const status = error.status || error.statusCode || 500;
  const message =
    error.message || 'Internal server error. Please try again later.';

  logger.error('Unhandled error', {
    status,
    message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    statusCode: status,
    message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
}
