import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, List, ListItem, ListItemText, 
  Button, Chip, Box, Pagination, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert
} from '@mui/material';
import { History, TrendingUp, Delete, Feedback } from '@mui/icons-material';

const AnalysisHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // GET - Fetch analysis history
  const fetchHistory = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/predict/history?limit=10&offset=${(pageNum - 1) * 10}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.items);
        setTotalPages(Math.ceil(data.total / 10));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // GET - Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/predict/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // GET - Fetch specific analysis
  const fetchAnalysisDetails = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/predict/history/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedAnalysis(data);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  // PUT - Update feedback
  const submitFeedback = async () => {
    if (!selectedAnalysis) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/predict/history/${selectedAnalysis.id}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      
      if (response.ok) {
        setFeedbackDialog(false);
        setFeedback('');
        fetchHistory(page); // Refresh history
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // DELETE - Remove analysis
  const deleteAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/predict/history/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchHistory(page); // Refresh history
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  // DELETE - Clear all history
  const clearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history? This cannot be undone.')) return;
    
    try {
      const response = await fetch('http://127.0.0.1:8000/predict/history', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setHistory([]);
        setStats(null);
        fetchStats();
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchHistory(value);
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          <History sx={{ mr: 2, verticalAlign: 'middle' }} />
          Analysis History
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center">
          View and manage your past misinformation analyses
        </Typography>
      </Paper>

      {/* Statistics Cards */}
      {stats && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
            Statistics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`Total: ${stats.total_analyses}`} color="primary" />
            <Chip label={`Fake: ${stats.fake_count}`} color="error" />
            <Chip label={`Real: ${stats.real_count}`} color="success" />
            <Chip label={`Avg Confidence: ${stats.avg_confidence}`} color="info" />
          </Box>
        </Paper>
      )}

      {/* History List */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Recent Analyses</Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={clearAllHistory}
            startIcon={<Delete />}
          >
            Clear All
          </Button>
        </Box>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : history.length === 0 ? (
          <Alert severity="info">No analyses found. Start by analyzing some tweets!</Alert>
        ) : (
          <List>
            {history.map((item) => (
              <ListItem
                key={item.id}
                sx={{ 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => fetchAnalysisDetails(item.id)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ maxWidth: '60%' }}>
                        {item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={item.prediction} 
                          color={item.prediction.toLowerCase().includes('fake') ? 'error' : 'success'}
                          size="small"
                        />
                        <Button
                          size="small"
                          startIcon={<Feedback />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnalysis(item);
                            setFeedback(item.user_feedback || '');
                            setFeedbackDialog(true);
                          }}
                        >
                          Feedback
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnalysis(item.id);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  }
                  secondary={`Confidence: ${item.confidence.toFixed(3)} | ${new Date(item.timestamp).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary" 
            />
          </Box>
        )}
      </Paper>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Feedback</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your feedback on this analysis"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={submitFeedback} variant="contained">Save Feedback</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AnalysisHistory;