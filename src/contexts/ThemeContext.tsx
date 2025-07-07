import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Get system theme preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Resolve the actual theme to apply
  const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Set theme and update DOM
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }

    // Resolve and apply theme
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    updateDOM(resolved);

    // Save user preference to backend if authenticated
    saveThemeToBackend(newTheme);
  };

  // Update DOM classes and CSS variables
  const updateDOM = (resolved: ResolvedTheme) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(resolved);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        resolved === 'dark' ? '#1f2937' : '#ffffff'
      );
    }

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: resolved } 
    }));
  };

  // Save theme preference to backend
  const saveThemeToBackend = async (themePreference: Theme) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/user/preferences/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme_preference: themePreference
        }),
      });
      
      // Silently ignore 404 errors for user preferences endpoint
      if (!response.ok && response.status !== 404) {
        console.warn(`Failed to save theme preference: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to save theme preference to backend:', error);
    }
  };

  // Load theme preference from backend
  const loadThemeFromBackend = async (): Promise<Theme | null> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const response = await fetch('http://localhost:8000/api/user/preferences/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.theme_preference || null;
      } else if (response.status === 404) {
        // User preferences endpoint doesn't exist, silently ignore
        return null;
      }
    } catch (error) {
      // Silently ignore network errors
      console.debug('Theme preference endpoint not available:', error);
    }
    return null;
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If currently system, toggle to opposite of current resolved theme
      setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const newResolvedTheme = getSystemTheme();
        setResolvedTheme(newResolvedTheme);
        updateDOM(newResolvedTheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      let initialTheme = defaultTheme;

      // 1. Try to load from backend (if authenticated)
      const backendTheme = await loadThemeFromBackend();
      if (backendTheme) {
        initialTheme = backendTheme;
      } else {
        // 2. Fall back to localStorage
        try {
          const storedTheme = localStorage.getItem(storageKey) as Theme;
          if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
            initialTheme = storedTheme;
          }
        } catch (error) {
          console.warn('Failed to load theme from localStorage:', error);
        }
      }

      // 3. Set the initial theme
      setThemeState(initialTheme);
      const resolved = resolveTheme(initialTheme);
      setResolvedTheme(resolved);
      updateDOM(resolved);
      setMounted(true);
    };

    initializeTheme();
  }, [defaultTheme, storageKey]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};