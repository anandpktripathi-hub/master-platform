import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './AuditLogViewer.css';

interface AuditLogEntry {
  _id: string;
  createdAt?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  status?: string;
  actorId?: { email?: string; name?: string } | string;
  changes?: string[];
  errorMessage?: string;
  ip?: string;
  userAgent?: string;
}

type AuditLogResponse = {
  data: AuditLogEntry[];
  total: number;
};

function actorLabel(actor: AuditLogEntry['actorId']): string {
  if (!actor) return '';
  if (typeof actor === 'string') return actor;
  return actor.email || actor.name || '';
}

function timeLabel(createdAt?: string): string {
  if (!createdAt) return '';
  try {
    return new Date(createdAt).toLocaleString();
  } catch {
    return createdAt;
  }
}

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = (await api.get('/audit-log', {
      params: { limit: 200, skip: 0, sortBy: '-createdAt' },
    })) as AuditLogResponse;

    setLogs(Array.isArray(res?.data) ? res.data : []);
  };

  const filteredLogs = logs.filter(
    log =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      (log.resourceType || '').toLowerCase().includes(filter.toLowerCase()) ||
      (actorLabel(log.actorId) || '').toLowerCase().includes(filter.toLowerCase())
  );

  const downloadCSV = () => {
    const header = ['time', 'user', 'action', 'resourceType', 'resourceId', 'status', 'changes', 'errorMessage'];
    const rows = filteredLogs.map(log => [
      timeLabel(log.createdAt),
      actorLabel(log.actorId),
      log.action,
      log.resourceType || '',
      log.resourceId || '',
      log.status || '',
      JSON.stringify(log.changes || []),
      log.errorMessage || ''
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="audit-log-viewer">
      <h3>Audit Log</h3>
      <input
        type="text"
        placeholder="Filter by action, resource, or user"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="audit-log-filter-input"
      />
      <button onClick={downloadCSV} className="audit-log-download-btn">Download CSV</button>
      <div className="audit-log-table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => (
              <tr key={idx}>
                <td>{timeLabel(log.createdAt)}</td>
                <td>{actorLabel(log.actorId)}</td>
                <td>{log.action}</td>
                <td>{[log.resourceType, log.resourceId].filter(Boolean).join(': ')}</td>
                <td>
                  <pre className="audit-log-details-pre">
                    {JSON.stringify(
                      {
                        status: log.status,
                        changes: log.changes,
                        errorMessage: log.errorMessage,
                        ip: log.ip,
                        userAgent: log.userAgent,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogViewer;
