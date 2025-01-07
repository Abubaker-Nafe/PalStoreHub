import React, { useContext, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Modal,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { toast } from "react-toastify";

interface AddNewStoreProps {
  open: boolean;
  onClose: () => void;
  onStoreAdded: () => void; // Callback to refresh the store list
}

const AddNewStore: React.FC<AddNewStoreProps> = ({
  open,
  onClose,
  onStoreAdded,
}) => {
  const { userData } = useContext(UserContext);

  const [storePicBase64, setStorePicBase64] = useState<string | null>(null);
  const [storePicError, setStorePicError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Validation schema using Yup
  const validationSchema = yup.object({
    name: yup
      .string()
      .required("Store name is required")
      .min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email format"),
    address: yup.string(),
    city: yup.string(),
    zipCode: yup.string(),
    latitude: yup.number().typeError("Must be a number"),
    longitude: yup.number().typeError("Must be a number"),
  });

  // File conversion function
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setStorePicError("File size must be less than 2 MB.");
        return;
      }
      const base64WithPrefix = await fileToBase64(file);
      setStorePicBase64(base64WithPrefix.split(",")[1]);
      setStorePicError(null);
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", {
        position: "bottom-right",
      });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        formik.setFieldValue("latitude", position.coords.latitude.toFixed(6));
        formik.setFieldValue("longitude", position.coords.longitude.toFixed(6));
        setLocationLoading(false);
        toast.success("Location fetched successfully!", {
          position: "bottom-right",
        });
      },
      (error) => {
        setLocationLoading(false);
        toast.error("Failed to fetch location. Please try again.", {
          position: "bottom-right",
        });
        console.error("Error fetching location:", error);
      }
    );
  };

  // Formik form setup
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      latitude: "",
      longitude: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        name: values.name,
        location: {
          address: values.address,
          city: values.city,
          zipCode: values.zipCode,
          coordinates: {
            latitude: parseFloat(values.latitude) || 0,
            longitude: parseFloat(values.longitude) || 0,
          },
        },
        email: values.email,
        ownerName: userData?.username,
        image: storePicBase64,
      };
      console.log("the payload is", payload);

      try {
        await axios.post(
          "https://pal-store-api.azurewebsites.net/api/stores/postStore",
          payload
        );
        toast.success("🎉 Store added successfully!", { position: "bottom-right" });
        onStoreAdded();
        onClose();
      } catch (error) {
        console.error("Error adding store:", error);
        toast.error("❌ Failed to add store. Please try again.", {
          position: "bottom-right",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>
          Add New Store
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Store Name"
                fullWidth
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={formik.values.address}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="city"
                label="City"
                fullWidth
                value={formik.values.city}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="zipCode"
                label="Zip Code"
                fullWidth
                value={formik.values.zipCode}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="latitude"
                label="Latitude"
                fullWidth
                value={formik.values.latitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.latitude && Boolean(formik.errors.latitude)}
                helperText={formik.touched.latitude && formik.errors.latitude}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="longitude"
                label="Longitude"
                fullWidth
                value={formik.values.longitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.longitude && Boolean(formik.errors.longitude)}
                helperText={formik.touched.longitude && formik.errors.longitude}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                Don’t know your location? Press the button below to fetch your current location.
              </Typography>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#1976d2", color: "#fff", '&:hover': { backgroundColor: "#115293" } }}
                onClick={handleFetchLocation}
                disabled={locationLoading}
                fullWidth
              >
                {locationLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Use My Location"}
              </Button>
            </Grid>
            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Add Store Logo:
              </Typography>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </Grid>
            {storePicError && (
              <Grid item xs={12}>
                <Typography color="error">{storePicError}</Typography>
              </Grid>
            )}
          </Grid>
          <Box mt={2} textAlign="right">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Submitting..." : "Add Store"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddNewStore;
