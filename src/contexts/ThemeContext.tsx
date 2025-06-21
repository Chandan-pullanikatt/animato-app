import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

type Spacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  white: string;
  black: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  disabled: string;
};

export type Theme = {
  colors: ThemeColors;
  spacing: Spacing;
};

type ThemeType = 'light' | 'dark';

type ThemeContextType = {
  theme: ThemeType;
  colors: ThemeColors;
  spacing: Spacing;
  toggleTheme: () => void;
};

// Spacing values (in pixels)
const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const lightColors: ThemeColors = {
  primary: '#6200ee',
  primaryDark: '#3700b3',
  primaryLight: '#bb86fc',
  secondary: '#03dac6',
  secondaryDark: '#018786',
  secondaryLight: '#f0f0f0',
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  white: '#ffffff',
  black: '#000000',
  border: '#e1e1e1',
  notification: '#ff9800',
  error: '#d32f2f',
  success: '#2e7d32',
  warning: '#f57c00',
  info: '#1976d2',
  disabled: '#bdbdbd',
};

const darkColors: ThemeColors = {
  primary: '#bb86fc',
  primaryDark: '#3700b3',
  primaryLight: '#e9b8ff',
  secondary: '#03dac6',
  secondaryDark: '#018786',
  secondaryLight: '#2a2a2a',
  background: '#121212',
  surface: '#1e1e1e',
  card: '#242424',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  white: '#ffffff',
  black: '#000000',
  border: '#333333',
  notification: '#ff9800',
  error: '#cf6679',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#64b5f6',
  disabled: '#666666',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Force light theme by default to ensure consistency between Expo Go and APK
  const [theme, setTheme] = useState<ThemeType>('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'dark' ? darkColors : lightColors;
  const themeValues = {
    colors,
    spacing,
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      ...themeValues, 
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
