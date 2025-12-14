import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationException } from '../exceptions/validation.exception';

type Metatype<T = unknown> = new (...args: unknown[]) => T;

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype as Metatype, value) as object;
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
    return value;
  }

  private toValidate(metatype: Metatype): boolean {
    const types: Metatype[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
