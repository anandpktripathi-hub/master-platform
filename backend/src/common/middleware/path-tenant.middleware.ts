import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PathTenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from /tenant/:tenantId path
    const match = req.path.match(/^\/tenant\/([a-zA-Z0-9_-]+)/);
    if (match) {
      (req as any)['tenantId'] = match[1];
    }
    next();
  }
}
