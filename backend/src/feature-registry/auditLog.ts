// Simple in-memory audit log for demonstration. Replace with DB or persistent store for production.
export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  featureId: string;
  details?: any;
}

export const auditLog: AuditLogEntry[] = [];
