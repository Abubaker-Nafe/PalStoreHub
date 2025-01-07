import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Modal,
  Grid,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";

interface AddNewProductProps {
  open: boolean;
  onClose: () => void;
  onProductAdded: () => void; // Callback to refresh the product list
  storeId: string;
}

const AddNewProduct: React.FC<AddNewProductProps> = ({
  open,
  onClose,
  onProductAdded,
  storeId,
}) => {
  const [productPicBase64, setProductPicBase64] = useState<string | null>(null);
  const [productPicError, setProductPicError] = useState<string | null>(null);

  // Validation schema using Yup
  const validationSchema = yup.object({
    productName: yup
      .string()
      .required("Product name is required")
      .min(2, "Name must be at least 2 characters"),
    description: yup
      .string()
      .required("Description is required")
      .min(5, "Description must be at least 5 characters"),
    price: yup
      .number()
      .typeError("Price must be a number")
      .required("Price is required")
      .positive("Price must be positive"),
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
        setProductPicError("File size must be less than 2 MB.");
        return;
      }
      const base64WithPrefix = await fileToBase64(file);
      setProductPicBase64(base64WithPrefix.split(",")[1]);
      setProductPicError(null);
    }
  };

  // Formik form setup
  const formik = useFormik({
    initialValues: {
      productName: "",
      description: "",
      price: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        storeId: storeId,
        productName: values.productName,
        description: values.description,
        price: parseFloat(values.price),
        image: productPicBase64,
      };
      console.log("Payload for new product:", payload);

      try {
        await axios.post(
          "https://pal-store-api.azurewebsites.net/api/Product/PostProduct/product",
          payload
        );
        toast.success("🎉 Product added successfully!", {
          position: "bottom-right",
        });
        onProductAdded(); // Refresh product list
        onClose(); // Close the modal
      } catch (error) {
        console.error("Error adding product:", error);
        toast.error("❌ Failed to add product. Please try again.", {
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
        <Typography variant="h6" mb={2} sx={{ fontWeight: "bold" }}>
          Add New Product
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* Product Name */}
            <Grid item xs={12}>
              <TextField
                name="productName"
                label="Product Name"
                fullWidth
                value={formik.values.productName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.productName &&
                  Boolean(formik.errors.productName)
                }
                helperText={
                  formik.touched.productName && formik.errors.productName
                }
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
              />
            </Grid>

            {/* Price */}
            <Grid item xs={12}>
              <TextField
                name="price"
                label="Price"
                fullWidth
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
            </Grid>

            {/* Add Product Image */}
            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Add Product Image:
              </Typography>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </Grid>
            {productPicError && (
              <Grid item xs={12}>
                <Typography color="error">{productPicError}</Typography>
              </Grid>
            )}
          </Grid>

          {/* Submit Button */}
          <Box mt={3} textAlign="right">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Submitting..." : "Add Product"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddNewProduct;
