import { Document } from 'mongoose';

export interface AuditLogParams {
  action: string;
  user: string;
  before?: Record<string, unknown> | Document;
  after?: Record<string, unknown> | Document;
  // ...other properties...
}
