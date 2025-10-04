import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Always use dark theme
  const theme = 'dark';

  useEffect(() => {
    // Set dark theme on mount
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const value = {
    theme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

