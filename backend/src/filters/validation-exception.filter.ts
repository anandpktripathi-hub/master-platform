import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const res: any = exception.getResponse();

    // Log the validation error details
    console.error('Validation error:', res);

    response.status(status).json({
      statusCode: status,
      message: res.message || res,
      error: res.error || 'Bad Request',
      details: res.message || res,
    });
  }
}
