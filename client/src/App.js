<<<<<<< HEAD
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

// Import pages
import Home from "./pages/home";
import Detector from "./pages/detector";
import Insights from "./pages/insights";
import About from "./pages/about";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/detector" element={<Detector />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
=======
import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';

function App() {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setError(null);
    setResult(null);

    if (!tweet.trim()) {
      setError('Please enter a tweet to analyze.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/predict/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tweet }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server returned ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const sampleTweets = [
    'Breaking: New study proves drinking water causes growth in brain size!',
    'Celebrity X endorses miracle cure — doctors baffled!',
    'Local community garden hosts free workshop this weekend.',
  ];

  const applySample = (t) => setTweet(t);

  const copyResult = async () => {
    if (!result) return;
    const text = `Prediction: ${result.prediction} (confidence: ${(result.confidence ?? 0).toFixed(3)})`;
    try { await navigator.clipboard.writeText(text); } catch (e) { /* ignore */ }
  };

  const clear = () => { setTweet(''); setResult(null); setError(null); };

  return (
    <div className="app-root">
      <Container maxWidth="sm">
        <Paper className="tweet-card" elevation={3}>
          <div className="accent-bar" />
          <Typography className="tweet-title" variant="h5" gutterBottom>
            Tweet Analyzer
          </Typography>
          <Typography className="tweet-subtitle" variant="body2" color="text.secondary" gutterBottom>
            Paste a tweet below and click Analyze to detect misinformation.
          </Typography>

          <div className="tweet-input">
            <TextField
              label="Enter tweet text"
              multiline
              rows={4}
              fullWidth
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
            />
          </div>

          <div className="sample-list">
            {sampleTweets.map((s) => (
              <div key={s} className="sample-item" onClick={() => applySample(s)}>{s.length > 40 ? s.slice(0,40) + '…' : s}</div>
            ))}
          </div>

          <Box className="action-row">
            <Button variant="contained" onClick={analyze} disabled={loading}>
              Analyze
            </Button>
            <IconButton aria-label="copy" onClick={copyResult} disabled={!result}>
              <ContentCopyIcon />
            </IconButton>
            <IconButton aria-label="clear" onClick={clear}>
              <ClearIcon />
            </IconButton>
            {loading && <CircularProgress size={24} />}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {result && (
            <div className="result-box">
              <Typography className="prediction-label" variant="subtitle1">Prediction</Typography>
              <Typography variant="h6">{String(result.prediction)}</Typography>
              <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
                <span className={`verdict ${String(result.prediction).toLowerCase().includes('fake') ? 'false' : 'true'}`}>{String(result.prediction)}</span>
                <Typography className="confidence" variant="body2">Confidence: {(result.confidence ?? 0).toFixed(3)}</Typography>
              </div>
            </div>
          )}
        </Paper>
      </Container>
    </div>
>>>>>>> parent of fa0bede (Enable multi-tweet analysis in UI)
  );
}

export default App;
