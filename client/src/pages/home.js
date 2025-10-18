import React from 'react';
import { 
  Container, Typography, Paper, Box, Grid, Card, CardContent, Button, useTheme, useMediaQuery, Stack, Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Security, Analytics, History, TrendingUp, Speed, VerifiedUser
} from '@mui/icons-material';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <Security sx={{ fontSize: { xs: 48, sm: 56, md: 64 } }} />,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning algorithms analyze content patterns to identify potential misinformation with high accuracy.',
      color: '#6366f1'
    },
    {
      icon: <Analytics sx={{ fontSize: { xs: 48, sm: 56, md: 64 } }} />,
      title: 'Real-time Analysis',
      description: 'Get instant results with comprehensive confidence scores and detailed analysis of your social media content.',
      color: '#06b6d4'
    },
    {
      icon: <History sx={{ fontSize: { xs: 48, sm: 56, md: 64 } }} />,
      title: 'Analysis History',
      description: 'Track your previous analyses and build a comprehensive understanding of information verification patterns.',
      color: '#10b981'
    }
  ];

  const stats = [
    { number: '95%', label: 'Accuracy Rate', icon: <VerifiedUser /> },
    { number: '< 1s', label: 'Response Time', icon: <Speed /> },
    { number: '24/7', label: 'Availability', icon: <TrendingUp /> }
  ];

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
        elevation={6} 
        sx={{ 
          p: { xs: 3, sm: 5, md: 8 }, 
          mb: { xs: 4, sm: 5, md: 6 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          display: { xs: 'none', md: 'block' }
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: { xs: 'none', md: 'block' }
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Security sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' } }} />
              <Analytics sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' } }} />
            </Box>
            
            <Typography 
              variant="h1"
              component="h1" 
              sx={{ 
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem', lg: '4.5rem' },
                background: 'linear-gradient(45deg, #ffffff 30%, #e2e8f0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              AI Misinformation Detection
            </Typography>
            
            <Typography 
              variant="h5" 
              sx={{ 
                opacity: 0.95,
                maxWidth: { xs: '100%', sm: '600px', md: '800px' },
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                fontWeight: 300
              }}
            >
              Harness the power of advanced machine learning to detect false information 
              and promote digital literacy in the age of information
            </Typography>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mt: 4, alignItems: 'center' }}
            >
              <Button 
                component={Link} 
                to="/detector" 
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: '#6366f1',
                  fontWeight: 'bold',
                  px: { xs: 3, sm: 4, md: 5 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  minHeight: '48px',
                  borderRadius: '24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Detection
              </Button>
              
              <Button 
                component={Link} 
                to="/about" 
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  minHeight: '48px',
                  borderRadius: '24px',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Statistics Section */}
      <Paper 
        elevation={2}
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 }, 
          mb: { xs: 4, sm: 5, md: 6 },
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            mb: { xs: 3, md: 4 }, 
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
          }}
        >
          Platform Statistics
        </Typography>
        
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={4} md={4} key={index}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    {React.cloneElement(stat.icon, { 
                      sx: { fontSize: { xs: 32, sm: 40 } } 
                    })}
                  </Box>
                  <Typography 
                    variant="h3" 
                    component="div" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'primary.main',
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                  >
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Features Section */}
      <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            mb: { xs: 3, md: 5 }, 
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
          }}
        >
          Platform Features
        </Typography>
        
        <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  borderRadius: '16px',
                  border: `2px solid ${feature.color}20`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 35px ${feature.color}30`,
                    borderColor: `${feature.color}40`
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                  <Box sx={{ mb: 3, color: feature.color }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      lineHeight: 1.7, 
                      mb: 3,
                      color: 'text.secondary',
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    {feature.description}
                  </Typography>
                  <Button 
                    component={Link} 
                    to={feature.title.includes('Detection') ? '/detector' : 
                        feature.title.includes('Analysis') ? '/insights' : '/history'} 
                    variant="contained"
                    sx={{
                      backgroundColor: feature.color,
                      '&:hover': {
                        backgroundColor: feature.color,
                        filter: 'brightness(0.9)'
                      },
                      borderRadius: '8px',
                      px: 3,
                      py: 1.5,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      minHeight: '44px'
                    }}
                  >
                    {feature.title.includes('Detection') ? 'Start Detection' : 
                     feature.title.includes('Analysis') ? 'View Analysis' : 'View History'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action Section */}
      <Paper 
        elevation={4}
        sx={{ 
          p: { xs: 4, sm: 5, md: 6 }, 
          textAlign: 'center',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '2px solid rgba(99, 102, 241, 0.1)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            mb: 3,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
          }}
        >
          Ready to Combat Misinformation?
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4, 
            maxWidth: '600px', 
            mx: 'auto',
            lineHeight: 1.6,
            color: 'text.secondary',
            fontSize: { xs: '1rem', sm: '1.125rem' }
          }}
        >
          Join the fight against false information. Use our AI-powered detection system 
          to verify content and promote digital literacy in your community.
        </Typography>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <Button 
            component={Link} 
            to="/detector" 
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 2,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              minHeight: '50px',
              borderRadius: '25px',
              fontWeight: 'bold',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Start Analyzing Now
          </Button>
          
          <Button 
            component={Link} 
            to="/about" 
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              py: 2,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              minHeight: '50px',
              borderRadius: '25px',
              fontWeight: 'bold',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Learn More
          </Button>
        </Stack>

        {/* Technology Badges */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{ mb: 2 }}
          >
            Powered by
          </Typography>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {['Machine Learning', 'Natural Language Processing', 'React.js', 'Python'].map((tech) => (
              <Chip
                key={tech}
                label={tech}
                variant="outlined"
                size={isSmall ? "small" : "medium"}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white'
                  },
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;