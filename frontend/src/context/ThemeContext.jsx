import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext(null);

const getSystemPrefersDark = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreference] = useState(() => {
    const storedPreference = localStorage.getItem('themePreference');
    if (storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system') {
      return storedPreference;
    }
    const legacyTheme = localStorage.getItem('theme');
    return legacyTheme === 'dark' ? 'dark' : 'light';
  });

  const [darkMode, setDarkMode] = useState(() => {
    if (themePreference === 'system') {
      return getSystemPrefersDark();
    }
    return themePreference === 'dark';
  });

  useEffect(() => {
    if (themePreference === 'system') {
      setDarkMode(getSystemPrefersDark());
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => setDarkMode(media.matches);
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', handler);
      } else {
        media.addListener(handler);
      }
      return () => {
        if (typeof media.removeEventListener === 'function') {
          media.removeEventListener('change', handler);
        } else {
          media.removeListener(handler);
        }
      };
    }
    setDarkMode(themePreference === 'dark');
    return undefined;
  }, [themePreference]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('themePreference', themePreference);
  }, [themePreference]);

  const toggleTheme = () =>
    setThemePreference((prev) => {
      if (prev === 'system') {
        return getSystemPrefersDark() ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });

  return (
    <ThemeContext.Provider
      value={{ darkMode, themePreference, setThemePreference, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
