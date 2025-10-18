import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './App.css';
import './theme.css';

// Import components and pages
import Navigation from './components/Navigation';
import Footer from './components/footer';
import Home from './pages/home';
import About from './pages/about';
import Insights from './pages/insights';
import MisinformationDetector from './pages/MisinformationDetector';
import AnalysisHistory from './pages/AnalysisHistory';

// Create a responsive theme with proper breakpoints
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo-500
      light: '#8b87f7',
      dark: '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06b6d4', // Cyan-500
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f6f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      '@media (min-width:600px)': {
        fontSize: '2.75rem',
      },
      '@media (min-width:900px)': {
        fontSize: '3.5rem',
      },
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      '@media (min-width:600px)': {
        fontSize: '2.25rem',
      },
      '@media (min-width:900px)': {
        fontSize: '3rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
      '@media (min-width:900px)': {
        fontSize: '2.25rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
          '@media (min-width: 1024px)': {
            paddingLeft: '32px',
            paddingRight: '32px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          minHeight: '44px', // Touch-friendly
          '@media (min-width: 600px)': {
            padding: '10px 20px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          color: '#0f172a',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
  spacing: 8,
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app-root">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/detector" element={<MisinformationDetector />} />
            <Route path="/history" element={<AnalysisHistory />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;