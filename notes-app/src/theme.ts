import { createTheme, rgba } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'violet',
  colors: {
    violet: [
      '#f5f0ff', // 0
      '#ede0ff', // 1
      '#dcc1ff', // 2
      '#c7a2fe', // 3
      '#b183fd', // 4
      '#9b65fb', // 5
      '#8547fa', // 6
      '#6e38d8', // 7
      '#5b2bb6', // 8
      '#481e95', // 9
    ],
    purple: [
      '#f3e8ff', // 0
      '#e9d5ff', // 1
      '#d8b4fe', // 2
      '#c084fc', // 3
      '#a855f7', // 4
      '#9333ea', // 5
      '#7e22ce', // 6
      '#6b21a8', // 7
      '#581c87', // 8
      '#4c1d95', // 9
    ],
    pink: [
      '#fdf2f8', // 0
      '#fce7f3', // 1
      '#fbcfe8', // 2
      '#f9a8d4', // 3
      '#f472b6', // 4
      '#ec4899', // 5
      '#db2777', // 6
      '#be185d', // 7
      '#9d174d', // 8
      '#831843', // 9
    ],
  },
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  defaultRadius: 'md',
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.05)',
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
    lg: '0 10px 15px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.05)',
    xl: '0 20px 25px rgba(0,0,0,0.07), 0 8px 10px rgba(0,0,0,0.05)',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        p: 'lg',
      },
      styles: {
        root: {
          transition: 'all 0.3s ease',
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        p: 'lg',
      },
      styles: {
        root: {
          transition: 'all 0.3s ease',
        },
      },
    },
  },
}); 