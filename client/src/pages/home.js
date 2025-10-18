import React from 'react';
import { 
  Container, Typography, Paper, Box, Grid, Card, CardContent, Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Security, Analytics, History
} from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      {/* Hero Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 4, sm: 6, md: 8 }, 
          mb: 6,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
          }}
        >
          AI Misinformation Detection
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4, 
            opacity: 0.9,
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Detect false information using advanced machine learning technology
        </Typography>
        
        <Button 
          component={Link} 
          to="/detector" 
          variant="contained"
          size="large"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 'bold',
            px: 4,
            py: 2,
            fontSize: '1.2rem',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)'
            },
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Start Detection
        </Button>
      </Paper>

      {/* Main Features */}
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Our Features
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3, color: 'primary.main' }}>
                <Security sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                AI Detection
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.6, mb: 3 }}>
                Advanced machine learning algorithms analyze text to identify potential misinformation.
              </Typography>
              <Button 
                component={Link} 
                to="/detector" 
                variant="contained"
                color="primary"
              >
                Start Detection
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3, color: 'secondary.main' }}>
                <Analytics sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Analytics
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.6, mb: 3 }}>
                View comprehensive data visualizations and insights about misinformation trends.
              </Typography>
              <Button 
                component={Link} 
                to="/insights" 
                variant="contained"
                color="secondary"
              >
                View Insights
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3, color: 'success.main' }}>
                <History sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                History
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.6, mb: 3 }}>
                Track and manage all your previous analyses with search and filtering.
              </Typography>
              <Button 
                component={Link} 
                to="/history" 
                variant="contained"
                color="success"
              >
                View History
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;