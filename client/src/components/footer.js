import React from 'react';
import { 
  Box, Container, Grid, Typography, Link, IconButton, Divider, Chip
} from '@mui/material';
import { 
  GitHub, LinkedIn, Email, Phone, LocationOn, 
  School, Code, Security, Analytics, Timeline
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 8
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                MisInfo Detector
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, lineHeight: 1.6 }}>
                AI-powered platform for detecting misinformation in social media content. 
                Built with cutting-edge machine learning to promote information integrity.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label="🤖 AI-Powered" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
                <Chip 
                  label="🔬 Research-Based" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
                <Chip 
                  label="⚡ Real-Time" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Technology Stack */}
        <Box sx={{ mt: 4, pt: 3 }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} />
          <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Built With Modern Technology
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {[
              'React.js', 'FastAPI', 'Material-UI', 'Chart.js', 'Python', 'Scikit-learn', 
              'Machine Learning', 'NLP', 'JavaScript', 'CSS3'
            ].map((tech, index) => (
              <Chip
                key={index}
                label={tech}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Background Decoration */}
        <Box sx={{
          position: 'absolute',
          bottom: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          top: 20,
          left: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          zIndex: 0
        }} />
      </Container>
    </Box>
  );
};

export default Footer;