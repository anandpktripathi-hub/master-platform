import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import logger from '../config/logger.config';

type HttpExceptionResponse =
  | string
  | {
      statusCode?: number;
      message?: string | string[];
      error?: string;
    };

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: HttpExceptionResponse | undefined = isHttpException
      ? (exception.getResponse() as HttpExceptionResponse)
      : undefined;

    const message =
      (typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse?.message) ||
      (exception instanceof Error ? exception.message : undefined) ||
      'Internal server error. Please try again later.';

    const error =
      (typeof exceptionResponse === 'string'
        ? undefined
        : exceptionResponse?.error) ||
      (isHttpException
        ? HttpStatus[status] ?? 'Error'
        : 'Internal Server Error');

    const details =
      typeof message === 'string' || Array.isArray(message) ? message : undefined;

    // Avoid leaking stack traces to clients; log server-side only.
    const stack = exception instanceof Error ? exception.stack : undefined;

    const payload = {
      statusCode: status,
      error,
      message: Array.isArray(details) ? 'Validation failed' : details,
      details: Array.isArray(details) ? details : undefined,
      path: request.originalUrl || request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    // Reduce noise for expected 4xx; keep 5xx as errors.
    if (status >= 500) {
      logger.error('Unhandled exception', {
        status,
        error,
        message,
        path: payload.path,
        method: payload.method,
        stack,
      });
    } else {
      logger.warn('Request failed', {
        status,
        error,
        message,
        path: payload.path,
        method: payload.method,
      });
    }

    response.status(status).json(payload);
  }
}
