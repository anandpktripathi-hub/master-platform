import React, { createContext, useContext, ReactNode } from 'react';
import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useSnackbar, SnackbarProvider } from 'notistack';

/**
 * React Query configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * API Error Toast Context
 * Provides a centralized way to show error toasts for API errors
 */
interface ApiErrorToastContextValue {
  showErrorToast: (error: Error | string | { message?: string; response?: { data?: { message?: string } } }) => void;
  showSuccessToast: (message: string) => void;
}

const ApiErrorToastContext = createContext<ApiErrorToastContextValue | undefined>(undefined);

function ApiErrorToastProviderInner({ children }: { children: ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();

  const showErrorToast = (error: Error | string | { message?: string; response?: { data?: { message?: string } } }) => {
    let message = 'An unexpected error occurred.';

    // Prefer backend-provided message when available (e.g. quota/payment errors)
    if (typeof error !== 'string' && (error as any)?.response?.data?.message) {
      message = (error as any).response.data.message;
    } else if (error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Map common quota/payment messages to more helpful guidance
    const lower = message.toLowerCase();
    if (message === 'User quota exceeded') {
      message = 'You have reached the user limit for your current plan. Visit Plans & Subscription to upgrade and add more team members.';
    } else if (message === 'Storage quota exceeded') {
      message = 'You have reached the storage limit for your current plan. Free up space or upgrade your plan to continue uploading.';
    } else if (message === 'API call quota exceeded') {
      message = 'You have exceeded the daily API call limit for your current plan. Consider upgrading your plan if you need higher API throughput.';
    } else if (lower.startsWith('payment failed')) {
      message = `${message} Please update your billing details or try a different payment method.`;
    } else if (lower.includes('does not allow custom domains')) {
      message = 'Your current plan does not include custom domains. Upgrade in Plans & Subscription to connect a custom domain.';
    }

    enqueueSnackbar(message, { variant: 'error' });
  };

  const showSuccessToast = (message: string) => {
    enqueueSnackbar(message, { variant: 'success' });
  };

  return (
    <ApiErrorToastContext.Provider value={{ showErrorToast, showSuccessToast }}>
      {children}
    </ApiErrorToastContext.Provider>
  );
}

/**
 * Hook to access error toast functionality
 */
export function useApiErrorToast() {
  const context = useContext(ApiErrorToastContext);
  if (!context) {
    // Instead of throwing, return a fallback context with no-op functions
    return {
      showErrorToast: () => {},
      showSuccessToast: () => {},
    };
  }
  return context;
}

/**
 * Combined Query Provider
 * Wraps app with React Query and Snackbar providers
 */
interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={5000}
    >
      <TanstackQueryClientProvider client={queryClient}>
        <ApiErrorToastProviderInner>
          {children}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </ApiErrorToastProviderInner>
      </TanstackQueryClientProvider>
    </SnackbarProvider>
  );
}

export { queryClient };
