import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminSettingsProvider } from './contexts/AdminSettingsContext';
import { QueryProvider } from './providers/QueryProvider';
import { router } from './router.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <ErrorBoundary>
          <AdminSettingsProvider>
            <RouterProvider router={router} />
          </AdminSettingsProvider>
        </ErrorBoundary>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>,
);
