import { HttpException } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(errors: any) {
    super({ message: 'Validation failed', errors }, 400);
  }
}














