import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminSettingsProvider } from './contexts/AdminSettingsContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { QueryProvider } from './providers/QueryProvider';
import { router } from './router.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import AnalyticsScripts from './components/analytics/AnalyticsScripts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <PermissionProvider>
          <ErrorBoundary>
            <AdminSettingsProvider>
              <AnalyticsScripts />
              <RouterProvider router={router} />
            </AdminSettingsProvider>
          </ErrorBoundary>
        </PermissionProvider>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>,
);
