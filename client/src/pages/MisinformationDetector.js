import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert, IconButton, Fab } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const MisinformationDetector = () => {
  const [tweets, setTweets] = useState([
    { id: Date.now(), text: '', loading: false, result: null, error: null, validation: {} },
  ]);

  // Enhanced validation function
  const validateTweet = (text) => {
    const errors = {};
    const warnings = {};
    
    // Required validation
    if (!text.trim()) {
      errors.required = 'Tweet text is required';
    }
    
    // Length validation
    if (text.length < 10) {
      warnings.minLength = 'Tweet is very short (less than 10 characters)';
    }
    if (text.length > 280) {
      errors.maxLength = 'Tweet exceeds 280 characters';
    }
    
    // Content validation
    if (text.trim().length < 5) {
      errors.content = 'Tweet must contain meaningful content';
    }
    
    // URL detection
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(text)) {
      warnings.hasUrls = 'Tweet contains URLs - may affect analysis accuracy';
    }
    
    // Excessive punctuation
    const excessivePunc = /[!?]{3,}/g;
    if (excessivePunc.test(text)) {
      warnings.punctuation = 'Excessive punctuation detected';
    }
    
    return { errors, warnings, isValid: Object.keys(errors).length === 0 };
  };

  const analyzeItem = async (id) => {
    setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, loading: true, error: null, result: null } : t)));
    const item = tweets.find((t) => t.id === id);
    
    // Enhanced validation
    const validation = validateTweet(item.text);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join('; ');
      setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, loading: false, error: errorMessages, validation } : t)));
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/predict/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: item.text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, loading: false, result: data, error: null } : t)));
    } catch (e) {
      setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, loading: false, error: String(e.message || e) } : t)));
    }
  };

  const analyzeAll = async () => {
    for (const t of tweets) {
      // eslint-disable-next-line no-await-in-loop
      await analyzeItem(t.id);
    }
  };

  const sampleTweets = [
    'Breaking: New study proves drinking water causes growth in brain size!',
    'Celebrity X endorses miracle cure — doctors baffled!',
    'Local community garden hosts free workshop this weekend.',
    'Elections coming up: make sure to verify your sources before sharing.'
  ];

  const applySample = (t) => {
    // apply sample to first empty tweet slot or append
    const firstEmpty = tweets.find((x) => !x.text.trim());
    if (firstEmpty) {
      setTweets((prev) => prev.map((x) => (x.id === firstEmpty.id ? { ...x, text: t } : x)));
    } else {
      setTweets((prev) => [...prev, { id: Date.now() + Math.random(), text: t, loading: false, result: null, error: null }]);
    }
  };

  const copyResult = async (id) => {
    const it = tweets.find((t) => t.id === id);
    if (!it || !it.result) return;
    const text = `Prediction: ${it.result.prediction} (confidence: ${(it.result.confidence ?? 0).toFixed(3)})`;
    try { await navigator.clipboard.writeText(text); } catch (e) { /* ignore */ }
  };

  const clearItem = (id) => {
    setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, text: '', result: null, error: null } : t)));
  };

  const addTweet = () => {
    setTweets((prev) => [...prev, { id: Date.now() + Math.random(), text: '', loading: false, result: null, error: null }]);
  };

  const removeTweet = (id) => {
    setTweets((prev) => prev.filter((t) => t.id !== id));
  };

  const updateText = (id, text) => {
    const validation = validateTweet(text);
    setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, text, validation } : t)));
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Misinformation Detector
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Analyze tweets and social media content to detect potential misinformation
        </Typography>
      </Paper>

      <Paper className="tweet-card" elevation={3}>
        <div className="accent-bar" />
        <Typography className="tweet-title" variant="h5" gutterBottom>
          Tweet Analyzer
        </Typography>
        <Typography className="tweet-subtitle" variant="body2" color="text.secondary" gutterBottom>
          Paste a tweet below and click Analyze to detect misinformation.
        </Typography>
        <div>
          <div className="tweet-inputs">
            {tweets.map((t, idx) => (
              <Box key={t.id} sx={{ mb: 2, position: 'relative' }}>
                <TextField
                  label={`Tweet ${idx + 1} ${t.text.length > 0 ? `(${t.text.length}/280)` : ''}`}
                  multiline
                  rows={3}
                  fullWidth
                  value={t.text}
                  onChange={(e) => updateText(t.id, e.target.value)}
                  error={t.validation?.errors && Object.keys(t.validation.errors).length > 0}
                  helperText={
                    t.validation?.errors && Object.keys(t.validation.errors).length > 0
                      ? Object.values(t.validation.errors)[0]
                      : t.validation?.warnings && Object.keys(t.validation.warnings).length > 0
                      ? Object.values(t.validation.warnings)[0]
                      : 'Enter tweet content to analyze for misinformation'
                  }
                  color={
                    t.validation?.warnings && Object.keys(t.validation.warnings).length > 0
                      ? 'warning'
                      : 'primary'
                  }
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                  <Button size="small" onClick={() => analyzeItem(t.id)} disabled={t.loading}>Analyze</Button>
                  <IconButton size="small" onClick={() => copyResult(t.id)} disabled={!t.result}><ContentCopyIcon fontSize="small"/></IconButton>
                  <IconButton size="small" onClick={() => clearItem(t.id)}><ClearIcon fontSize="small"/></IconButton>
                  <IconButton size="small" onClick={() => removeTweet(t.id)}><DeleteIcon fontSize="small"/></IconButton>
                  {t.loading && <CircularProgress size={18} />}
                </Box>

                {t.error && <Alert severity="error" sx={{ mt: 1 }}>{t.error}</Alert>}

                {t.result && (
                  <div className="result-box">
                    <Typography className="prediction-label" variant="subtitle2">Prediction</Typography>
                    <Typography variant="body1">{String(t.result.prediction)}</Typography>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
                      <span className={`verdict ${String(t.result.prediction).toLowerCase().includes('fake') ? 'false' : 'true'}`}>{String(t.result.prediction)}</span>
                      <Typography className="confidence" variant="body2">Confidence: {(t.result.confidence ?? 0).toFixed(3)}</Typography>
                    </div>
                  </div>
                )}
              </Box>
            ))}
          </div>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sample Tweets
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Click on any sample below to test the detector:
            </Typography>
            <div className="sample-list">
              {sampleTweets.map((s) => (
                <div key={s} className="sample-item" title={s} onClick={() => applySample(s)}>
                  {s.length > 48 ? s.slice(0,48) + '…' : s}
                </div>
              ))}
            </div>
          </Box>

          <Box className="action-row" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={analyzeAll}>Analyze All</Button>
            <Fab size="small" color="primary" onClick={addTweet} aria-label="add" sx={{ ml: 'auto' }}>
              <AddIcon />
            </Fab>
          </Box>
        </div>
      </Paper>
    </Container>
  );
};

export default MisinformationDetector;