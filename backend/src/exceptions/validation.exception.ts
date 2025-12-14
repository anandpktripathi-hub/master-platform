import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(errors: unknown) {
    super({ message: 'Validation failed', errors }, HttpStatus.BAD_REQUEST);
  }
}
