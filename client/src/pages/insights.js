import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Box, Card, CardContent, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Insights = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Sample data - in a real application, this would come from your API
  const misinformationStats = {
    total: 1247,
    fake: 312,
    real: 935,
    accuracy: 87.3
  };

  const categoryData = {
    labels: ['Politics', 'Health', 'Technology', 'Sports', 'Entertainment', 'Science'],
    datasets: [{
      label: 'Misinformation Cases',
      data: [45, 32, 18, 12, 25, 8],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };

  const accuracyData = {
    labels: ['Fake News Detection', 'Real News Detection'],
    datasets: [{
      data: [misinformationStats.fake, misinformationStats.real],
      backgroundColor: ['#FF6B6B', '#4ECDC4'],
      hoverBackgroundColor: ['#FF5252', '#26C6DA']
    }]
  };

  const trendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Fake News Detected',
        data: [12, 19, 15, 25, 22, 18, 14],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      },
      {
        label: 'Real News Verified',
        data: [45, 52, 48, 61, 58, 55, 49],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Detection Insights & Analytics
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center">
          Data-driven insights into misinformation patterns and detection performance
        </Typography>
      </Paper>

      {/* Key Statistics */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <Typography color="text.secondary" gutterBottom>
                Total Analyzed
              </Typography>
              <Typography variant="h4" component="div">
                {misinformationStats.total.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <Typography color="text.secondary" gutterBottom>
                Fake Detected
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                {misinformationStats.fake}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <Typography color="text.secondary" gutterBottom>
                Real Verified
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {misinformationStats.real}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <Typography color="text.secondary" gutterBottom>
                Accuracy
              </Typography>
              <Typography variant="h4" component="div" color="primary.main">
                {misinformationStats.accuracy}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Range Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="day">Last Day</MenuItem>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Charts */}
      <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" gutterBottom>
              Misinformation by Category
            </Typography>
            <Box sx={{ height: 400 }}>
              <Bar data={categoryData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" gutterBottom>
              Detection Accuracy
            </Typography>
            <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '300px', height: '300px' }}>
                <Pie data={accuracyData} options={{ ...chartOptions, maintainAspectRatio: false }} />
              </div>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" gutterBottom>
              Detection Trends Over Time
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line data={trendData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Insights Summary */}
      <Paper sx={{ p: { xs: 3, sm: 4 }, mt: 6, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Key Insights
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              Most Common Misinformation Topics
            </Typography>
            <Typography variant="body2" paragraph>
              Political content represents 32% of detected misinformation, followed by health-related 
              misinformation at 23%. This aligns with global trends in misinformation patterns.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              Detection Performance
            </Typography>
            <Typography variant="body2" paragraph>
              Our model maintains an 87.3% accuracy rate with particularly strong performance in 
              detecting health misinformation (92% accuracy) and political misinformation (85% accuracy).
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Insights;