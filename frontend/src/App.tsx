import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { AppRoutes } from "./routes/AppRoutes";
import { ThemeProvider } from "./providers/ThemeProvider";
import { BreadcrumbProvider } from "./contexts/BreadcrumbContext";
import { Toaster } from "react-hot-toast";
import { PWAUpdateToast } from "./components/PWAUpdateToast";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <BreadcrumbProvider>
              <AppRoutes />
              <Toaster
                position="top-right"
                containerStyle={{ zIndex: 999999 }}
                toastOptions={{
                  className: "z-[999999]",
                  duration: 4000,
                  style: {
                    fontFamily: "var(--smart-font-sans)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--smart-ink)",
                    background: "#fff",
                    border: "1px solid var(--smart-border)",
                    borderRadius: "12px",
                    boxShadow: "var(--smart-shadow-md)",
                    padding: "12px 16px",
                    maxWidth: "380px",
                  },
                  success: {
                    iconTheme: { primary: "#059669", secondary: "#ecfdf5" },
                  },
                  error: {
                    iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
                  },
                }}
              />
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
