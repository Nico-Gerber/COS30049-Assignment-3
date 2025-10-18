import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Insights', path: '/insights' },
    { label: 'Detector', path: '/detector' },
    { label: 'History', path: '/history' }
  ];

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => toggleDrawer(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 250,
          backgroundColor: 'background.paper',
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Menu</Typography>
        <IconButton onClick={() => toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.path}
            component={Link}
            to={item.path}
            onClick={() => toggleDrawer(false)}
            sx={{
              backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
              color: location.pathname === item.path ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: location.pathname === item.path ? 'primary.dark' : 'action.hover'
              },
              margin: 1,
              borderRadius: 1,
              textDecoration: 'none'
            }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 'bold'
            }}
          >
            COS30049 Assignment 3
          </Typography>
          
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={() => toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  variant={location.pathname === item.path ? 'outlined' : 'text'}
                  sx={{
                    borderColor: location.pathname === item.path ? 'white' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    fontSize: { md: '0.875rem', lg: '1rem' },
                    px: { md: 1, lg: 2 }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {isMobile && mobileMenu}
    </>
  );
};

export default Navigation;