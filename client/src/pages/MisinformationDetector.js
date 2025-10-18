import React, { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, CircularProgress, 
  Alert, IconButton, Fab, useTheme, useMediaQuery, Stack, Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';
import axios from 'axios';

const MisinformationDetector = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      const response = await axios.post('http://127.0.0.1:8000/predict/', {
        text: item.text
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      const data = response.data;
      setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, loading: false, result: data, error: null } : t)));
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        errorMessage = serverError.detail || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (error.code === 'ECONNABORTED') {
        // Request timeout
        errorMessage = 'Request timed out. Please try again.';
      } else {
        // Something else happened
        errorMessage = error.message || 'Network error occurred';
      }
      
      setTweets((prev) => prev.map((t) => (t.id === id ? { ...t, loading: false, error: errorMessage } : t)));
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
    <Container 
      maxWidth="lg" 
      sx={{ 
        px: { xs: 1, sm: 2, md: 3, lg: 4 }, 
        py: { xs: 2, sm: 3, md: 4 } 
      }}
    >
      {/* Hero Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4, md: 6 }, 
          mb: { xs: 3, sm: 4, md: 5 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: '16px'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SecurityIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, mr: 1 }} />
          <AnalyticsIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }} />
        </Box>
        <Typography 
          variant={isSmall ? "h4" : isMobile ? "h3" : "h2"}
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold' }}
        >
          Misinformation Detector
        </Typography>
        <Typography 
          variant={isSmall ? "body1" : "h6"}
          sx={{ opacity: 0.9, maxWidth: '600px', mx: 'auto' }}
        >
          Analyze tweets and social media content to detect potential misinformation using AI-powered analysis
        </Typography>
      </Paper>

      {/* Main Analysis Section */}
      <Paper 
        className="tweet-card" 
        elevation={3}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <div className="accent-bar" />
        <Typography 
          className="tweet-title" 
          variant={isMobile ? "h5" : "h4"}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <SecurityIcon color="primary" />
          Tweet Analyzer
        </Typography>
        <Typography 
          className="tweet-subtitle" 
          variant="body1"
          color="text.secondary" 
          gutterBottom
          sx={{ mb: 3 }}
        >
          Enter tweet content below and click Analyze to detect potential misinformation patterns.
        </Typography>

        {/* Tweet Input Section */}
        <Box sx={{ mb: 4 }}>
          {tweets.map((t, idx) => (
            <Paper
              key={t.id}
              elevation={1}
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: 3,
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.1)'
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label={`Tweet ${idx + 1} ${t.text.length > 0 ? `(${t.text.length}/280)` : ''}`}
                  multiline
                  rows={isSmall ? 3 : 4}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '8px'
                    }
                  }}
                />

                {/* Action Buttons */}
                <Stack 
                  direction={isSmall ? "column" : "row"} 
                  spacing={1} 
                  sx={{ 
                    justifyContent: 'space-between',
                    alignItems: isSmall ? 'stretch' : 'center'
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Button 
                      variant="contained"
                      size={isSmall ? "small" : "medium"}
                      onClick={() => analyzeItem(t.id)} 
                      disabled={t.loading}
                      startIcon={<AnalyticsIcon />}
                      sx={{ minWidth: isSmall ? '100%' : 'auto' }}
                    >
                      Analyze
                    </Button>
                    {t.loading && <CircularProgress size={20} />}
                  </Stack>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton 
                      size="small" 
                      onClick={() => copyResult(t.id)} 
                      disabled={!t.result}
                      title="Copy Result"
                    >
                      <ContentCopyIcon fontSize="small"/>
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => clearItem(t.id)}
                      title="Clear Content"
                    >
                      <ClearIcon fontSize="small"/>
                    </IconButton>
                    {tweets.length > 1 && (
                      <IconButton 
                        size="small" 
                        onClick={() => removeTweet(t.id)}
                        title="Remove Tweet"
                      >
                        <DeleteIcon fontSize="small"/>
                      </IconButton>
                    )}
                  </Stack>
                </Stack>

                {/* Error Display */}
                {t.error && (
                  <Alert 
                    severity="error" 
                    sx={{ borderRadius: '8px' }}
                  >
                    {t.error}
                  </Alert>
                )}

                {/* Results Display */}
                {t.result && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      borderRadius: '12px',
                      borderLeft: '4px solid #4f46e5'
                    }}
                  >
                    <Typography 
                      variant="subtitle1"
                      sx={{ 
                        fontWeight: 600,
                        color: '#4f46e5',
                        mb: 1
                      }}
                    >
                      Analysis Result
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {String(t.result.prediction)}
                    </Typography>
                    <Stack 
                      direction={isSmall ? "column" : "row"} 
                      spacing={2} 
                      sx={{ alignItems: isSmall ? 'flex-start' : 'center' }}
                    >
                      <Chip
                        label={String(t.result.prediction)}
                        color={String(t.result.prediction).toLowerCase().includes('fake') ? 'error' : 'success'}
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase'
                        }}
                      />
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: '#6b7280',
                          fontWeight: 500
                        }}
                      >
                        Confidence: {(t.result.confidence ?? 0).toFixed(3)}
                      </Typography>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* Sample Tweets Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"}
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Sample Tweets
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{ mb: 3 }}
          >
            Click on any sample below to test the detector:
          </Typography>
          
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 2,
            mb: 3
          }}>
            {sampleTweets.map((s, index) => (
              <Paper
                key={s}
                elevation={1}
                onClick={() => applySample(s)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)'
                  }
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: 1.4,
                    wordWrap: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {s}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Stack 
          direction={isSmall ? "column" : "row"}
          spacing={2} 
          sx={{ 
            justifyContent: 'space-between',
            alignItems: isSmall ? 'stretch' : 'center',
            pt: 3,
            borderTop: '1px solid #e2e8f0'
          }}
        >
          <Button 
            variant="contained" 
            size={isSmall ? "medium" : "large"}
            onClick={analyzeAll}
            startIcon={<AnalyticsIcon />}
            sx={{ 
              minHeight: '48px',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Analyze All Tweets
          </Button>
          <Button
            variant="outlined"
            size={isSmall ? "medium" : "large"}
            onClick={addTweet}
            startIcon={<AddIcon />}
            sx={{ 
              minHeight: '48px',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Add Tweet
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default MisinformationDetector;