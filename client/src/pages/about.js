import React from 'react';
import { Container, Typography, Paper, Box, Grid, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle, School, Code, Analytics } from '@mui/icons-material';

const About = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          About This Project
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          COS30049 - Computing Technology Innovation Project
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Project Overview
            </Typography>
            <Typography variant="body1" paragraph>
              This project is part of the Computing Technology Innovation Project (COS30049) at Swinburne University. 
              It focuses on developing an AI-powered system to detect misinformation in social media content, 
              specifically targeting tweets and similar short-form text content.
            </Typography>
            <Typography variant="body1" paragraph>
              The system uses advanced machine learning techniques to analyze text patterns, sentiment, 
              and linguistic features that are commonly associated with misinformation. By providing real-time 
              analysis and confidence scores, it helps users make more informed decisions about the content they encounter.
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="body1" paragraph>
              Our misinformation detection system employs a multi-step process:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Text Preprocessing" 
                  secondary="Cleaning and normalizing input text for analysis" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Feature Extraction" 
                  secondary="Identifying linguistic patterns and sentiment indicators" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="AI Model Analysis" 
                  secondary="Running the text through our trained machine learning model" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Results & Confidence" 
                  secondary="Providing classification results with confidence scores" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              <School sx={{ mr: 1, verticalAlign: 'middle' }} />
              Academic Context
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              <strong>Course:</strong> COS30049 - Computing Technology Innovation Project
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>University:</strong> Swinburne University of Technology
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Assignment:</strong> Assignment 3
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
              Technical Stack
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              <strong>Frontend:</strong> React.js, Material-UI
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Backend:</strong> Python, FastAPI
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Machine Learning:</strong> Scikit-learn, Natural Language Processing
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Visualization:</strong> Chart.js, React Chart.js 2
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
              Key Features
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              <ListItem disablePadding>
                <ListItemText primary="• Real-time misinformation detection" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="• Confidence score analysis" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="• Batch processing capabilities" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="• Interactive data visualizations" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="• Sample tweet testing" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          This project demonstrates the application of machine learning and web technologies 
          to address real-world challenges in information verification and digital literacy.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;