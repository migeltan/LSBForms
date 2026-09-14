import { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * SMART Portal is currently a single, fixed light theme (see
 * src/styles/theme-smart.css for the design tokens). This provider exists
 * so the rest of the app — and any future dark-mode / high-contrast work —
 * has a stable place to read theme state from, without every page needing
 * to know how theming is implemented.
 */

interface ThemeContextValue {
  theme: 'smart-light';
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'smart-light' });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ThemeContextValue>(() => ({ theme: 'smart-light' }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
