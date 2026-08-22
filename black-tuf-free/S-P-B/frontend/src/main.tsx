import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from '@/store';
import App from '@/App';
import '@/index.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnMount: false, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <App />
              <Toaster
                position="bottom-center"
                toastOptions={{
                  className: '!bg-card !border-border !text-foreground',
                  success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
                }}
              />
            </ThemeProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
