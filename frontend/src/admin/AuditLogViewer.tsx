import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuditLogViewer.css';

interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  featureId: string;
  details?: any;
}

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await axios.get('/api/audit-log');
    setLogs(res.data);
  };

  const filteredLogs = logs.filter(
    log =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.featureId.toLowerCase().includes(filter.toLowerCase()) ||
      (log.user && log.user.toLowerCase().includes(filter.toLowerCase()))
  );

  const downloadCSV = () => {
    const header = ['timestamp', 'user', 'action', 'featureId', 'details'];
    const rows = filteredLogs.map(log => [
      log.timestamp,
      log.user,
      log.action,
      log.featureId,
      JSON.stringify(log.details)
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
        placeholder="Filter by action, feature, or user"
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
              <th>Feature</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => (
              <tr key={idx}>
                <td>{log.timestamp}</td>
                <td>{log.user}</td>
                <td>{log.action}</td>
                <td>{log.featureId}</td>
                <td><pre className="audit-log-details-pre">{JSON.stringify(log.details, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogViewer;
