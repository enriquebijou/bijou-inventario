import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: { 
      main: '#0a1628',       // Negro azulado profundo
      light: '#1a237e',
      dark: '#000000'
    },
    secondary: { 
      main: '#d4a017',       // Dorado elegante
      light: '#e6c347',
      dark: '#9e7700'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#0a1628',
      secondary: '#4a5568'
    },
    success: { main: '#1b5e20' },
    error: { main: '#b71c1c' },
    warning: { main: '#e65100' }
  },
  typography: {
    fontFamily: '"Calibri Light", "Calibri", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 600, letterSpacing: '0.02em' },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    body1: { fontWeight: 300 },
    body2: { fontWeight: 300 },
    button: { fontWeight: 400, letterSpacing: '0.03em' }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0a1628 0%, #1a237e 100%)',
          boxShadow: '0 4px 20px rgba(10, 22, 40, 0.4)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #0a1628 0%, #0d1b3e 50%, #1a237e 100%)',
          color: '#ffffff'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 400,
          letterSpacing: '0.03em'
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0a1628 0%, #1a237e 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
          }
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #d4a017 0%, #b8860b 100%)',
          color: '#0a1628',
          fontWeight: 500,
          '&:hover': {
            background: 'linear-gradient(135deg, #e6c347 0%, #d4a017 100%)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 2px 16px rgba(10, 22, 40, 0.06)',
          border: '1px solid rgba(10, 22, 40, 0.04)'
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#0a1628',
            color: '#ffffff',
            fontWeight: 400,
            letterSpacing: '0.04em',
            fontSize: '0.8rem'
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(212, 160, 23, 0.04)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 400
        },
        colorSuccess: {
          backgroundColor: '#1b5e20',
          color: '#fff'
        },
        colorError: {
          backgroundColor: '#b71c1c',
          color: '#fff'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d4a017'
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#0a1628'
          }
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(10, 22, 40, 0.08)'
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0a1628',
              color: '#fff',
              borderRadius: '8px',
              fontFamily: 'Calibri Light, Calibri, sans-serif',
              border: '1px solid rgba(212, 160, 23, 0.3)'
            },
            success: {
              style: { background: '#1b5e20' }
            },
            error: {
              style: { background: '#b71c1c' }
            }
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
