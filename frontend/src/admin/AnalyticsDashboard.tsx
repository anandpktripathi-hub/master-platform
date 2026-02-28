import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import Papa from 'papaparse';
import './AnalyticsDashboard.css';

interface AuditLogEntry {
  _id: string;
  createdAt?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  status?: string;
  actorId?: { email?: string; name?: string } | string;
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

const AnalyticsDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = (await api.get('/audit-log', {
      params: { limit: 200, skip: 0, sortBy: '-createdAt' },
    })) as AuditLogResponse;
    setLogs(Array.isArray(res?.data) ? res.data : []);
  };

  // Most common actions
  const actionCounts: Record<string, number> = {};
  logs.forEach(log => {
    const key = log.action || 'unknown';
    actionCounts[key] = (actionCounts[key] || 0) + 1;
  });
  const mostCommonActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Most active users
  const userCounts: Record<string, number> = {};
  logs.forEach(log => {
    const user = actorLabel(log.actorId) || 'unknown';
    userCounts[user] = (userCounts[user] || 0) + 1;
  });
  const mostActiveUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Recent events
  const recentChanges = logs.slice(-10).reverse();

  // Status trends (last 30 events)
  const statusTrends = logs
    .slice(-30)
    .map((log) => {
      const status = log.status || 'unknown';
      return {
        time: log.createdAt || '',
        success: status === 'success' ? 1 : 0,
        failure: status === 'failure' ? 1 : 0,
        pending: status === 'pending' ? 1 : 0,
      };
    });

  // Chart data
  const featureChangeChartData = mostCommonActions.map(([action, count]) => ({ feature: action, count }));
  const userActivityChartData = mostActiveUsers.map(([user, count]) => ({ user, count }));
  const enableTrendChartData = statusTrends;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE'];

  const handleExportCSV = () => {
    const csv = Papa.unparse(logs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'analytics-logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>
      <button onClick={handleExportCSV} className="analytics-export-btn">Export All Logs (CSV)</button>
      <div className="analytics-charts-container">
        <div>
          <h4>Most Common Actions</h4>
          <ResponsiveContainer width={300} height={220}>
            <BarChart data={featureChangeChartData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="feature" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4>Most Active Users</h4>
          <ResponsiveContainer width={300} height={220}>
            <PieChart>
              <Pie data={userActivityChartData} dataKey="count" nameKey="user" cx="50%" cy="50%" outerRadius={80} label>
                {userActivityChartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4>Status Trends (last 30)</h4>
          <ResponsiveContainer width={400} height={220}>
            <LineChart data={enableTrendChartData}>
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="success" stroke="#22c55e" name="Success" />
              <Line type="monotone" dataKey="failure" stroke="#e11d48" name="Failure" />
              <Line type="monotone" dataKey="pending" stroke="#eab308" name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4>Recent Events</h4>
          <ul>
            {recentChanges.map((log, idx) => (
              <li key={idx}>
                {(log.createdAt || '').toString()} - {actorLabel(log.actorId) || 'unknown'} - {log.action} - {(log.resourceType || '')}{log.resourceId ? `:${log.resourceId}` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
