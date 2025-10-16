import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './App.css';
import './theme.css';

// Import components and pages
import Navigation from './components/Navigation';
import Home from './pages/home';
import About from './pages/about';
import Insights from './pages/insights';
import MisinformationDetector from './pages/MisinformationDetector';
import AnalysisHistory from './pages/AnalysisHistory';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
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
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;