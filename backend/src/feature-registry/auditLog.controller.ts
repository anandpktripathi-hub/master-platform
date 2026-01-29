import { Controller, Get } from '@nestjs/common';
import { auditLog } from './auditLog';

@Controller('audit-log')
export class AuditLogController {
  @Get()
  getAll() {
    return auditLog;
  }
}
