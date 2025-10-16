import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Paper, Box, Grid, Card, CardContent, Button, 
  Chip, Avatar, Fade, Grow, LinearProgress, Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Timeline, Analytics, Security, TrendingUp, Speed, Shield,
  VerifiedUser, Assessment, History, School
} from '@mui/icons-material';

const Home = () => {
  const [stats, setStats] = useState({ total: 0, accuracy: 0, analyses: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading statistics
    const timer = setTimeout(() => {
      setStats({ total: 2457, accuracy: 94.2, analyses: 1847 });
      setLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      {/* Hero Section */}
      <Fade in={true} timeout={1000}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 4, sm: 6, md: 8 }, 
            mb: 6,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Chip 
              label="🔬 AI-Powered Detection" 
              sx={{ 
                mb: 3, 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
              }}
            >
              Combat Misinformation with AI
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
              Advanced machine learning platform that analyzes social media content 
              to identify and combat false information in real-time
            </Typography>
            
            {/* Quick Stats */}
            <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
              <Grid item xs={4} sm={3}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                    {loaded ? `${stats.total.toLocaleString()}+` : '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Texts Analyzed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={3}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00FF7F' }}>
                    {loaded ? `${stats.accuracy}%` : '0%'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Accuracy Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={3}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#87CEEB' }}>
                    {loaded ? `${stats.analyses.toLocaleString()}+` : '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Users Helped
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Background decoration */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            zIndex: 1
          }} />
        </Paper>
      </Fade>

      {/* Main Features */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
          Powerful Features
        </Typography>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {[
            {
              icon: <Security sx={{ fontSize: 70 }} />,
              title: "AI-Powered Detection",
              description: "Advanced machine learning algorithms analyze text patterns, sentiment, and linguistic features to identify potential misinformation with 94.2% accuracy.",
              link: "/detector",
              color: "primary",
              gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              buttonText: "Start Detection",
              delay: 0
            },
            {
              icon: <Analytics sx={{ fontSize: 70 }} />,
              title: "Deep Analytics",
              description: "Comprehensive data visualizations and insights reveal misinformation trends, patterns, and distribution across different categories and time periods.",
              link: "/insights",
              color: "secondary", 
              gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              buttonText: "View Insights",
              delay: 200
            },
            {
              icon: <History sx={{ fontSize: 70 }} />,
              title: "Analysis History",
              description: "Track all your previous analyses, add feedback, and manage your detection history with powerful search and filtering capabilities.",
              link: "/history",
              color: "success",
              gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              buttonText: "View History",
              delay: 400
            }
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Grow in={loaded} timeout={1000 + feature.delay}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                    },
                    background: feature.gradient,
                    color: 'white'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 3, sm: 4 } }}>
                    <Box sx={{ mb: 3, opacity: 0.9 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ opacity: 0.9, lineHeight: 1.6, mb: 3 }}>
                      {feature.description}
                    </Typography>
                    <Button 
                      component={Link} 
                      to={feature.link} 
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-2px)'
                        },
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {feature.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Technology Stack */}
      <Fade in={loaded} timeout={1500}>
        <Paper sx={{ p: { xs: 4, sm: 6 }, mb: 8, backgroundColor: '#f8fafc' }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Cutting-Edge Technology
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  Advanced AI Architecture
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Machine Learning Accuracy</Typography>
                    <Typography variant="body2">94.2%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={94.2} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Processing Speed</Typography>
                    <Typography variant="body2">98.7%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={98.7} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Confidence Score</Typography>
                    <Typography variant="body2">91.5%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={91.5} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {[
                  { icon: <Speed />, title: "Real-time Analysis", desc: "Instant processing of text content" },
                  { icon: <Shield />, title: "Secure Platform", desc: "Privacy-focused data handling" },
                  { icon: <VerifiedUser />, title: "Validated Results", desc: "Peer-reviewed algorithms" },
                  { icon: <Assessment />, title: "Detailed Reports", desc: "Comprehensive analysis insights" }
                ].map((tech, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Box sx={{ color: 'primary.main', mb: 1 }}>
                        {tech.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {tech.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tech.desc}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Mission Statement */}
      <Fade in={loaded} timeout={2000}>
        <Box sx={{ mt: 8, mb: 6, textAlign: 'center', px: { xs: 2, sm: 4 } }}>
          <Paper sx={{ p: { xs: 4, sm: 6 }, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
              Our Mission: Combat Misinformation
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
              Misinformation poses serious threats to public health, democratic processes, and social cohesion. 
              Our AI-powered platform empowers users to identify and combat false information, promoting a more informed and resilient society.
            </Typography>
            
            <Grid container spacing={4} sx={{ mt: 4 }}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <TrendingUp sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Real Impact
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Helping thousands of users make informed decisions about information credibility
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <School sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Academic Excellence
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Built on rigorous research and validated through peer-reviewed methodologies
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <VerifiedUser sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Trusted Platform
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Transparent algorithms and explainable AI for trustworthy results
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>

      {/* Call to Action */}
      <Fade in={loaded} timeout={2500}>
        <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', color: 'white' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Ready to Fight Misinformation?
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
            Join thousands of users who trust our AI-powered platform to verify information and combat false news.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              component={Link} 
              to="/detector"
              variant="contained"
              size="large"
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)'
                }
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
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default Home;