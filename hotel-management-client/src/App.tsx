import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Provider } from 'react-redux';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/common/Dashboard';
import RoomsPage from './components/rooms/RoomsPage';
import GuestsPage from './components/guests/GuestsPage';
import BookingsPage from './components/bookings/BookingsPage';
import StaffPage from './components/staff/StaffPage';
import ServicesPage from './components/services/ServicesPage';
import InvoicesPage from './components/invoices/InvoicesPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import QuickBookingPage from './components/quick-booking/QuickBookingPage';
import ServiceSales from './components/service-sales/ServiceSales';
import StaysPage from './components/stays/StaysPage';

// Тема приложения
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#81C784', 
      light: '#A5D6A7',
      dark: '#66BB6A',
      contrastText: '#2E4A2E', 
    },
    secondary: {
      main: '#FFB74D', 
      light: '#FFCC80',
      dark: '#FF9800',
      contrastText: '#5D4037', 
    },
    background: {
      default: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      paper: '#ffffff',
    },
    success: {
      main: '#A5D6A7',
      light: '#C8E6C9',
      dark: '#81C784',
      contrastText: '#2E7D32',
    },
    warning: {
      main: '#FFCC80',
      light: '#FFE0B2',
      dark: '#FFB74D',
      contrastText: '#E65100',
    },
    error: {
      main: '#EF9A9A',
      light: '#FFCDD2',
      dark: '#E57373',
      contrastText: '#C62828',
    },
    info: {
      main: '#90CAF9',
      light: '#BBDEFB',
      dark: '#64B5F6',
      contrastText: '#0D47A1',
    },
    text: {
      primary: '#2C3E50', 
      secondary: '#546E7A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#2C3E50',
    },
    h4: {
      fontWeight: 600,
      color: '#34495E',
    },
    h6: {
      fontWeight: 600,
      color: '#2C3E50',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2C3E50',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '20px',
          border: '1px solid rgba(129, 199, 132, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          color: '#2C3E50',
        },
        contained: {
          background: 'linear-gradient(45deg, #81C784, #A5D6A7)',
          color: '#2E4A2E',
          boxShadow: '0 4px 15px rgba(129, 199, 132, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #66BB6A, #81C784)',
            boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#81C784',
          color: '#2E4A2E',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#66BB6A',
            backgroundColor: 'rgba(129, 199, 132, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          color: '#2C3E50',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(129, 199, 132, 0.15)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #E8F5E8 0%, #F1F8E9 100%)',
          color: '#2E4A2E',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '4px 8px',
          transition: 'all 0.3s ease',
          color: '#2E4A2E',
          '&:hover': {
            background: 'rgba(255,255,255,0.2)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(45deg, #FFB74D, #FFCC80)',
            color: '#5D4037',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          fontWeight: 600,
          '&:not(.status-chip)': {
            background: 'linear-gradient(45deg, #FFB74D, #FFCC80)',
            color: '#5D4037',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF9800, #FFB74D)',
            },
          },
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(129, 199, 132, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#81C784',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#66BB6A',
              boxShadow: '0 0 0 3px rgba(129, 199, 132, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#546E7A',
            '&.Mui-focused': {
              color: '#2E4A2E',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(129, 199, 132, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #E8F5E8, #F1F8E9)',
          '& .MuiTableCell-head': {
            color: '#2E4A2E',
            fontWeight: 600,
            fontSize: '0.95rem',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(90deg, rgba(129, 199, 132, 0.05), rgba(165, 214, 167, 0.05))',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #FFB74D, #FFCC80)',
          color: '#5D4037',
          boxShadow: '0 4px 12px rgba(255, 183, 77, 0.3)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          color: '#546E7A',
          '&:hover': {
            transform: 'scale(1.1)',
            background: 'rgba(129, 199, 132, 0.1)',
            color: '#2E4A2E',
          },
        },
      },
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex' }}>
            <Navbar onSidebarToggle={handleSidebarToggle} />
            <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                ml: '30px',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh',
                backgroundColor: 'background.default',
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/guests" element={<GuestsPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/quick-booking" element={<QuickBookingPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/service-sales" element={<ServiceSales />} />
                <Route path="/stays" element={<StaysPage />} />

              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
  );
}

export default App;
