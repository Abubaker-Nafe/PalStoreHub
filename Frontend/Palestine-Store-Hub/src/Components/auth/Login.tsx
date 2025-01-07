import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingIndicator from '../UI/LoadingIndicator';

import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Stack,
  Paper,
} from '@mui/material';

// Define the primary blue color
const primaryBlue = '#0078D7';

// Validation schema for username and password
const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

// Function to hash the password using Web Crypto API
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password); //convert the password to a byte array
  const hashBuffer = await crypto.subtle.digest('SHA-256', data); //generate the SHA-256 hash
  const hashArray = Array.from(new Uint8Array(hashBuffer)); //convert buffer to byte array
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join(''); //Convert to hexadecimal string
};

export const Login: React.FC = () => {
  const { setUserData, setIsLogin } = useContext(UserContext); // access UserContext
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(false); //to manage loading state

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true); // Start loading
      try {
        // Hash the password
        const hashedPassword = await hashPassword(values.password);
        const username = values.username;

        //encode the query parameters
        const encodedUsername = encodeURIComponent(username);
        const encodedPassword = encodeURIComponent(hashedPassword);

        //construct the URL with query parameters
        const url = `https://pal-store-api.azurewebsites.net/api/user/auth/login?username=${encodedUsername}&password=${encodedPassword}`;

        //send the GET request
        const response = await axios.get(url);
        console.log('Login successful: all returned data are:', response.data);

        // Save user data in context and localStorage
        const userData = response.data; //extract the user data from the response
        setUserData(userData); //update UserContext
        setIsLogin(true); //mark user as logged in
        localStorage.setItem('storeOwner', JSON.stringify(userData)); //save to localStorage

        //show success toast
        toast.success(`🎉 Welcome back, ${userData.profile.firstName}!`, {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });

        //navigate to home page
        navigate('/');
      } catch (error) {
        // Handle errors
        //Axios errors (errors that occur during the execution of an Axios request )
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          switch (status) {
            case 404:
              toast.error('❌ User not found. Please check your username.', {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
              break;
            case 401:
              toast.error('❌ Incorrect username or password. Please try again.', {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
              break;
            case 500:
              toast.error('❌ Internal server error. Please try again later.', {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
              break;
            default:
              toast.error(`❌ Unexpected error: ${status}. Please try again later.`, {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
          }
        } else {
          //General Errors:any other errors that are unrelated to Axios or HTTP responses
          console.error('Unexpected error:', error);
          toast.error('❌ Something went wrong. Please try again later.', {
            position: 'bottom-right',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }
      } finally {
        setLoading(false); // Stop loading
      }
    },
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 6,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Show Loading Indicator when loading */}
        {loading && <LoadingIndicator message="Logging you in, please wait..." />}
        {!loading && (
          <>
            <Typography
              component="h1"
              variant="h3"
              align="center"
              sx={{ marginBottom: 4, color: primaryBlue, fontWeight: 'bold' }}
            >
              Login
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Stack spacing={4}>
                {/* Username Field */}
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  InputProps={{
                    sx: { fontSize: '1.25rem' },
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.25rem' },
                  }}
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    sx: { fontSize: '1.25rem' },
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.25rem' },
                  }}
                />

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    fontSize: '1.25rem',
                    padding: '12px 0',
                    backgroundColor: primaryBlue,
                    color: '#fff',
                    '&:hover': { backgroundColor: '#005BB5' },
                  }}
                >
                  Login
                </Button>
              </Stack>
            </Box>

             {/* Sign-up Text */}
             <Typography
              variant="body2"
              align="center"
              sx={{ marginTop: '1.5rem', color: 'gray' }}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: primaryBlue,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Sign up
              </Link>
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Login;
