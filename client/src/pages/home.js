import React from 'react';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Timeline, Analytics, Security } from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Welcome to the Misinformation Detection Platform
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Your comprehensive tool for analyzing and detecting misinformation in social media content
        </Typography>
      </Paper>

      <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Detect Misinformation
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Use our advanced AI model to analyze tweets and detect potential misinformation with high accuracy.
              </Typography>
              <Button 
                component={Link} 
                to="/detector" 
                variant="contained" 
                color="primary"
                fullWidth
              >
                Start Detection
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <Analytics sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                View Insights
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Explore data visualizations and analytics about misinformation patterns and trends.
              </Typography>
              <Button 
                component={Link} 
                to="/insights" 
                variant="contained" 
                color="secondary"
                fullWidth
              >
                View Insights
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <Timeline sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Learn More
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Discover how our system works and learn about the importance of fighting misinformation.
              </Typography>
              <Button 
                component={Link} 
                to="/about" 
                variant="contained" 
                color="info"
                fullWidth
              >
                About Project
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 8, mb: 4, textAlign: 'center', px: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Why Fight Misinformation?
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth="md" sx={{ mx: 'auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
          Misinformation can have serious consequences on public health, democracy, and social cohesion. 
          Our platform helps identify and combat false information to promote a more informed society.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;