import React from 'react';
import { Container, Typography, Paper, Box, Grid, Avatar, Card, CardContent } from '@mui/material';
import { Person, School, Email } from '@mui/icons-material';

const About = () => {
  const teamMembers = [
    {
      name: "Aryan Manishkumar Prajapati",
      role: "Full Stack Developer",
      studentId: "103522112",
      email: "103522112@student.swin.edu.au",
      description: "Responsible for frontend development, UI/UX design, and system integration."
    },
    {
      name: "Nico Gerber",
      role: "Machine Learning Engineer",
      studentId: "104551609",
      email: "104551609@student.swin.edu.au",
      description: "Responsible for Visualisations"
    },
    {
      name: "Quinn Friend",
      role: "Data Analyst",
      studentId: "105374674",
      email: "105374674@student.swin.edu.au",
      description: "Responsible for data preprocessing, model evaluation, and performance analysis."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Visionary Trio
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          COS30049 - Computing Technology Innovation Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-Powered Misinformation Detection System
        </Typography>
      </Paper>

      {/* Team Members */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Meet Our Team
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
        {teamMembers.map((member, index) => (
          <Grid item xs={12} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <Person sx={{ fontSize: 40 }} />
                </Avatar>
                
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {member.name}
                </Typography>
                
                <Typography variant="h6" color="primary" gutterBottom>
                  {member.role}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <School sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {member.studentId}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {member.email}
                  </Typography>
                </Box>
                
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
                  {member.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Project Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Project Information
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            <strong>Course:</strong> COS30049 - Computing Technology Innovation Project
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            <strong>University:</strong> Swinburne University of Technology
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Assignment:</strong> Assignment 3 - AI Misinformation Detection System
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;