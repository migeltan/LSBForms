import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { AppRoutes } from './routes/AppRoutes';
import { ThemeProvider } from './providers/ThemeProvider';
import { BreadcrumbProvider } from './contexts/BreadcrumbContext';
import { Toaster } from 'react-hot-toast';
import { PWAUpdateToast } from './components/PWAUpdateToast';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <BreadcrumbProvider>
              <AppRoutes />
              <Toaster position="top-right" toastOptions={{ className: 'z-[999999]' }} containerStyle={{ zIndex: 999999 }} />
              {/* PWA update/offline-ready banner — mounted globally */}
              <PWAUpdateToast />
            </BreadcrumbProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
