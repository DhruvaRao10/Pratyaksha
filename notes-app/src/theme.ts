//@ts-nocheck
import { createTheme, type MantineColorsTuple, type MantineThemeOverride } from '@mantine/core';

// Vibrant and bold color palette
const indigoColor: MantineColorsTuple = [
  '#eef2ff',
  '#e0e7ff',
  '#c7d2fe',
  '#a5b4fc',
  '#818cf8',
  '#6366f1',
  '#4f46e5',
  '#4338ca',
  '#3730a3',
  '#312e81',
];

const emeraldColor: MantineColorsTuple = [
  '#ecfdf5',
  '#d1fae5',
  '#a7f3d0',
  '#6ee7b7',
  '#34d399',
  '#10b981',
  '#059669',
  '#047857',
  '#065f46',
  '#064e3b',
];

const amberColor: MantineColorsTuple = [
  '#fffbeb',
  '#fef3c7',
  '#fde68a',
  '#fcd34d',
  '#fbbf24',
  '#f59e0b',
  '#d97706',
  '#b45309',
  '#92400e',
  '#78350f',
];

export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 5, dark: 6 },

  colors: {
    indigo: indigoColor,
    emerald: emeraldColor,
    amber: amberColor,
  },

  fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  defaultRadius: 'xl',

  defaultProps: {
    bg: 'gray.1',
  },

  components: {
    Button: {
      defaultProps: {
        variant: 'gradient',
        gradient: { from: 'indigo', to: 'emerald', deg: 45 },
        radius: 'xl',
      },
      styles: () => ({
        root: {
          fontWeight: 700,
          padding: '10px 20px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
      }),
    },

    Card: {
      defaultProps: {
        shadow: 'md',
        radius: 'xl',
        withBorder: false,
        bg: 'white',
      },
      styles: () => ({
        root: {
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      }),
    },

    Paper: {
      defaultProps: {
        shadow: 'sm',
        radius: 'xl',
        bg: 'white',
        p: 'lg',
      },
    },

    TextInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: () => ({
        input: {
          borderColor: indigoColor[4],
          '&:focus': {
            borderColor: indigoColor[6],
            boxShadow: `0 0 0 3px ${indigoColor[2]}`,
          },
        },
        label: {
          fontWeight: 600,
          color: indigoColor[7],
        },
      }),
    },

    AppShell: {
      styles: () => ({
        main: {
          backgroundColor: '#f9fafb',
          transition: 'background-color 0.3s ease',
        },
        navbar: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)',
        },
      }),
    },

    Title: {
      styles: () => ({
        root: {
          fontWeight: 800,
          color: indigoColor[8],
          letterSpacing: '-0.02em',
        },
      }),
    },

    Badge: {
      defaultProps: {
        variant: 'gradient',
        gradient: { from: 'amber', to: 'emerald', deg: 90 },
        radius: 'md',
      },
      styles: () => ({
        root: {
          fontWeight: 600,
          textTransform: 'none',
        },
      }),
    },
  },

  shadows: {
    xs: '0 4px 8px rgba(0,0,0,0.1)',
    sm: '0 6px 12px rgba(0,0,0,0.12)',
    md: '0 10px 20px rgba(0,0,0,0.15)',
    lg: '0 14px 28px rgba(0,0,0,0.18)',
    xl: '0 20px 40px rgba(0,0,0,0.2)',
  },

  headings: {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 800,
    sizes: {
      h1: { fontSize: '3rem', lineHeight: '1.1' },
      h2: { fontSize: '2.25rem', lineHeight: '1.2' },
      h3: { fontSize: '1.75rem', lineHeight: '1.3' },
      h4: { fontSize: '1.5rem', lineHeight: '1.4' },
      h5: { fontSize: '1.25rem', lineHeight: '1.5' },
      h6: { fontSize: '1rem', lineHeight: '1.5' },
    },
  },
});

// ThemeProps for styled-components
export interface ThemeProps {
  background: string;
  text: string;
}