import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Container
      sx={{
        textAlign: 'center',
        paddingTop: '5rem',
        paddingBottom: '5rem',
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Oops! The page you're looking for doesn't exist.
      </Typography>
      <Typography variant="body1" gutterBottom>
        It seems you've hit a dead end. Let's get you back on track!
      </Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
