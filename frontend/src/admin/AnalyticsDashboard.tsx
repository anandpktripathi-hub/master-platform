import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import Papa from 'papaparse';
import './AnalyticsDashboard.css';

interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  featureId: string;
  details?: any;
}

const AnalyticsDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await axios.get('/api/audit-log');
    setLogs(res.data);
  };

  // Most changed features
  const featureChangeCounts: Record<string, number> = {};
  logs.forEach(log => {
    if (!featureChangeCounts[log.featureId]) featureChangeCounts[log.featureId] = 0;
    featureChangeCounts[log.featureId]++;
  });
  const mostChangedFeatures = Object.entries(featureChangeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Most active users
  const userCounts: Record<string, number> = {};
  logs.forEach(log => {
    if (!userCounts[log.user]) userCounts[log.user] = 0;
    userCounts[log.user]++;
  });
  const mostActiveUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Recent permission changes
  const recentChanges = logs.slice(-10).reverse();

  // Feature enable/disable trends (last 30 actions)
  const enableTrends = logs
    .filter(log => log.action === 'toggle')
    .slice(-30)
    .map(log => ({
      time: log.timestamp,
      enabled: log.details && log.details.enabled,
      feature: log.featureId,
    }));

  // Chart data
  const featureChangeChartData = mostChangedFeatures.map(([feature, count]) => ({ feature, count }));
  const userActivityChartData = mostActiveUsers.map(([user, count]) => ({ user, count }));
  const enableTrendChartData = enableTrends.map((trend) => ({
    time: trend.time,
    enabled: trend.enabled ? 1 : 0,
    disabled: trend.enabled ? 0 : 1,
    feature: trend.feature,
  }));

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
          <h4>Most Changed Features</h4>
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
          <h4>Enable/Disable Trends (last 30)</h4>
          <ResponsiveContainer width={400} height={220}>
            <LineChart data={enableTrendChartData}>
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enabled" stroke="#22c55e" name="Enabled" />
              <Line type="monotone" dataKey="disabled" stroke="#e11d48" name="Disabled" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4>Recent Permission Changes</h4>
          <ul>
            {recentChanges.map((log, idx) => (
              <li key={idx}>{log.timestamp} - {log.user} - {log.action} - {log.featureId}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
