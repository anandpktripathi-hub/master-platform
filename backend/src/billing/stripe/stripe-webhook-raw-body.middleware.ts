import { Injectable, NestMiddleware } from '@nestjs/common';
import { raw } from 'body-parser';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class StripeWebhookRawBodyMiddleware implements NestMiddleware {
  private readonly parser = raw({ type: 'application/json' });

  use(req: Request, res: Response, next: NextFunction) {
    this.parser(req, res, next);
  }
}
