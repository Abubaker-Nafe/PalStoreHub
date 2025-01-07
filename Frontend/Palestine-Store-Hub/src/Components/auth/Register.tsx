import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import {toast} from 'react-toastify';
import LoadingIndicator from '../UI/LoadingIndicator';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
} from '@mui/material';


// Define the blue color
const primaryBlue = '#0078D7';

// Validation schema for form inputs
const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(3, 'First name must be at least 3 characters')
    .matches(/^[A-Za-z]+$/, 'First name must contain only letters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(3, 'Last name must be at least 3 characters')
    .matches(/^[A-Za-z]+$/, 'Last name must contain only letters'),
  userName: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .test(
      'starts-with-lowercase',
      'Username must start with a lowercase letter',
      (value) => /^[a-z]/.test(value || '')
    )
    .test(
      'only-valid-characters',
      'Username can only contain lowercase letters, numbers, and underscores',
      (value) => /^[a-z0-9_]+$/.test(value || '')
    ),
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  phone: yup
    .string()
    .required('Phone is required')
    .matches(/^[0-9]{10,15}$/, 'Phone must be a valid number with 10-15 digits'),
  dateOfBirth: yup
    .date()
    .required('Date of birth is required')
    .typeError('Invalid date format'),
});

export const Register: React.FC = () => {
  const [profilePicBase64, setProfilePicBase64] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [profilePicName, setProfilePicName] = useState<string>(''); // State to store file name
  const [profilePicError, setProfilePicError] = useState<string | null>(null); // State for error message
  const [loading, setLoading] = useState(false); // State to manage loading indicator
  const navigate = useNavigate();



  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    const processFile = async (file: File) => {
      // Check file size (2 MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setProfilePicError('File size must be less than 2 MB.');
        return;
      }
    
      try {
        const base64WithPrefix = await fileToBase64(file);
        const base64 = base64WithPrefix.split(',')[1];
        setProfilePicBase64(base64);
        setProfilePicName(file.name); // Update file name
        setProfilePicError(null); // Clear any previous error message
      } catch (error) {
        console.error('Error processing the file:', error);
        setProfilePicError('An error occurred while uploading the file.');
      }
    };

    const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        processFile(file); // Use the new function to handle the file
      }
    };

  // Function to hash the password using Web Crypto API
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password); // Convert the password to a byte array
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); // Generate the SHA-256 hash
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join(''); // Convert to hexadecimal string
  };


  //check if the username is taken while typing 
  const checkUsernameAvailability = async (username: string) => {
    if (!username) return;

    try {
      // if the axios.get request is successful, the username already exists in the database.
      await axios.get(`https://pal-store-api.azurewebsites.net/api/user/getUser/${username}`);
      setUsernameError('Username is already taken'); // Username is taken
    } catch (error) {
      if (axios.isAxiosError(error)) { //isXiosError helps confirm that the error is an Axios error and not some unrelated runtime error.
        if (error.response && error.response.status === 404) {//check if the error returned by the axios request is specifically a 404 Not Found error
          setUsernameError(null); // Username is available
        } else {
          console.error('Error checking username availability:', error);
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true); // Start loading
      try {
        const hashedPassword = await hashPassword(values.password); // Hash the password

        const payload = {
          username: values.userName,
          email: values.email,
          passwordHash: hashedPassword,
          phone: values.phone,
          
          profile: {
            firstName: values.firstName,
            lastName: values.lastName,
            dateOfBirth: values.dateOfBirth,
            image: profilePicBase64,
          },
        };

        console.log('Payload:', payload);
         
        //API Request
        const { data } = await axios.post(
          'https://pal-store-api.azurewebsites.net//api/user/auth/Signup',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        //navigate to login page upon success
        navigate('/login');

        //show toast message when success registration
        toast.success(`🎉 Registration successful! Welcome aboard, ${values.firstName}!`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
        console.log('Registration successful:', data); //print Registration successful in console


      } catch (error) {
        toast.error('❌ Registration failed! Please try again.', {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        console.error('Error during registration:', error);//print Error during registration in console
      }finally {
        setLoading(false); // Stop loading
      }
    }
  });

  useEffect(() => {
    checkUsernameAvailability(formik.values.userName);
  }, [formik.values.userName]);

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#ffffff' }}>
        {loading && <LoadingIndicator message="Submitting your details, please wait..." />}
        {!loading && (
          <>
            <Typography
              component="h1"
              variant="h4"
              align="center"
              sx={{ marginBottom: 3, color: primaryBlue }}
            >
              Create Your Account
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                  />
                </Grid>
  
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="userName"
                    name="userName"
                    label="Username"
                    value={formik.values.userName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.userName && (Boolean(formik.errors.userName) || Boolean(usernameError))}
                    helperText={formik.touched.userName && (formik.errors.userName || usernameError)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
  
                <Grid item xs={12} sm={6}>
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="dateOfBirth"
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                    helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                  />
                </Grid>
  
                {/* Drag & Drop Profile Picture */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      border: '2px dashed #0078D7',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#f9f9f9',
                      cursor: 'pointer',
                      justifyContent: 'center',
                    }}
                    onClick={() => document.getElementById('profilePic')?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault(); // Prevent the default behavior (e.g., opening the file in a new tab)
                      const file = e.dataTransfer.files[0]; // Get the first dropped file
                      if (file) {
                        processFile(file); // Directly process the dropped file
                      }
                    }}
                  >
                    {!profilePicBase64 && (
                      <>
                        <Typography variant="body1" color="primary">
                          Drag & Drop or Click to Upload Profile Picture
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', marginTop: 1 }}>
                          {profilePicName || 'No file selected'}
                        </Typography>
                      </>
                    )}
  
                    {profilePicBase64 && (
                      <img
                        src={`data:image/png;base64,${profilePicBase64}`}
                        alt="Profile Preview"
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          border: '1px solid #ccc',
                        }}
                      />
                    )}
  
                    {profilePicBase64 && (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        sx={{
                          backgroundColor: '#d32f2f',
                          '&:hover': { backgroundColor: '#c62828' },
                        }}
                        onClick={() => {
                          setProfilePicBase64(null);
                          setProfilePicName('');
                        }}
                      >
                        Remove
                      </Button>
                    )}
  
                    <input
                      type="file"
                      id="profilePic"
                      name="profilePic"
                      onChange={handleProfilePicChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </Box>
  
                  {profilePicError && (
                    <Typography variant="body2" sx={{ marginTop: 1, color: 'red' }}>
                      {profilePicError}
                    </Typography>
                  )}
                </Grid>
              </Grid>
  
              <Box sx={{ marginTop: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ backgroundColor: primaryBlue, color: '#fff', '&:hover': { backgroundColor: '#005BB5' } }}
                >
                  Sign Up
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
  
  
  
};

export default Register;
