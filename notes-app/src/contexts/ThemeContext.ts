//@ts-nocheck
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { useThemeMode } from '../hooks/useThememode';
// import { ThemeProvider } from '@emotion/react';
// import { lightTheme, darkTheme } from '../../styles/themes';

const ThemeContext: React.FC = ({ children }) => {
  const { theme } = useThemeMode();

  // const themeMode = theme === 'dark' ? darkTheme : lightTheme;

  return {children} as ThemeProvider;
};

export default ThemeContext;
