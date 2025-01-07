import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Button,
} from '@mui/material';

import ShopIcon from '@mui/icons-material/Shop';
import { UserContext } from '../context/UserContext';

export const Navbar: React.FC = () => {
  const { isLogin, userData, setIsLogin, setUserData } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('storeOwner'); // Remove user data from localStorage
    sessionStorage.clear(); // Clear all session storage data
    setIsLogin(false); // Update context state
    setUserData(null); // Clear user data
    navigate('/login'); // Redirect to login page
  };

  return (
    <AppBar position="fixed" sx={{ width: '100%', background: '#343a40' }}>
      <Toolbar>
        {/* Icon and Brand Name */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="logo"
          onClick={() => navigate('/')} // Navigate to home page
        >
          <ShopIcon sx={{ fontSize: '2.8rem' }} />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, ml: 1 }}
        >
          Palestine Store Hub
        </Typography>

        {/* Navigation Links */}
        <Stack direction="row" spacing={2}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{
              textTransform: 'none',
              fontSize: '1.3rem',
              transition: '0.3s',
              '&:hover': {
                backgroundColor: '#ffffff',
                color: '#343a40',
                borderRadius: '4px',
              },
            }}
          >
            Home
          </Button>

          {isLogin ? (
            <>
              {/* Profile Link */}
              <Button
                color="inherit"
                component={Link}
                to="/profile"
                sx={{
                  textTransform: 'none',
                  fontSize: '1.3rem',
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#343a40',
                    borderRadius: '4px',
                  },
                }}
              >
                {userData?.profile?.firstName || 'User'}'s Profile
              </Button>

              {/* Logout Button */}
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  textTransform: 'none',
                  fontSize: '1.3rem',
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#343a40',
                    borderRadius: '4px',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              {/* Login and Register Links */}
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  textTransform: 'none',
                  fontSize: '1.3rem',
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#343a40',
                    borderRadius: '4px',
                  },
                }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                sx={{
                  textTransform: 'none',
                  fontSize: '1.3rem',
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#343a40',
                    borderRadius: '4px',
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
