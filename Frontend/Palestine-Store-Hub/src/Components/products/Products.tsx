import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Productcard } from "./Productcard";
import LoadingIndicator from "../UI/LoadingIndicator";
import AddNewProduct from "./AddNewProduct";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

type Product = {
  productName: string;
  description: string;
  price: number;
  image: string;
};

type Store = {
  name: string;
};

const Products: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const location = useLocation();
  const isOwner = location.state?.isOwner || false; // Retrieve isOwner flag from navigation state

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);

  // Fetch store details and products
  const fetchProducts = async () => {
    if (!storeId) return;

    // Check session storage for cached products
    const cachedProducts = sessionStorage.getItem(`products_${storeId}`);
    if (cachedProducts) {
      const parsedProducts = JSON.parse(cachedProducts);
      setProducts(parsedProducts);
      setFilteredProducts(parsedProducts);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch store name
      const storeResponse = await fetch(
        `https://pal-store-api.azurewebsites.net/api/stores/getStoreById/${storeId}`
      );
      if (!storeResponse.ok) throw new Error("Failed to fetch store details");

      const storeData: Store = await storeResponse.json();
      setStoreName(storeData.name);

      // Fetch products
      const productsResponse = await fetch(
        `https://pal-store-api.azurewebsites.net/api/Product/getStoreProducts/${storeId}`
      );
      if (!productsResponse.ok) throw new Error("Failed to fetch products");

      const productsData: Product[] = await productsResponse.json();
      setProducts(productsData);
      setFilteredProducts(productsData);
      sessionStorage.setItem(`products_${storeId}`, JSON.stringify(productsData)); // Cache products
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle product search
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
      return;
    }

    setSearchLoading(true);
    const searchUrl = `https://pal-store-api.azurewebsites.net/api/Product/SearchProducts?storeId=${storeId}&productName=${encodeURIComponent(
      searchQuery
    )}`;

    try {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error("No products found with the specified name.");
      }
      const searchResults: Product[] = await response.json();
      setFilteredProducts(searchResults);
      setError(null);
    } catch {
      setFilteredProducts([]);
      setError("No products found for the given search term.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredProducts(products);
  };

  return (
    <Box sx={{ marginTop: 10, padding: 2 }}>
      <Container maxWidth="lg">
        {/* Store Title */}
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          {storeName ? `${storeName} Products` : "Products"}
        </Typography>

        {/* Add New Product Button (Conditional for Store Owners) */}
        {isOwner && (
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsAddProductOpen(true)}
              sx={{ fontWeight: "bold", borderRadius: 2 }}
            >
              Add New Product
            </Button>
          </Box>
        )}

        {/* Search Box */}
        <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
          <TextField
            fullWidth
            placeholder="Search for products..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ marginRight: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={!searchLoading ? handleSearch : undefined}
            disabled={searchLoading}
            sx={{
              backgroundColor: searchLoading ? "#1976d2" : "#1976d2",
              color: "#fff",
              opacity: searchLoading ? 0.7 : 1,
              "&:hover": {
                backgroundColor: "#115293",
              },
            }}
            startIcon={
              searchLoading ? (
                <LoadingIndicator message="" style={{ height: "1rem" }} />
              ) : null
            }
          >
            {searchLoading ? "SEARCHING..." : "Search"}
          </Button>
        </Box>

        {/* Product Cards Section with Loading Overlay */}
        <Box
          sx={{
            position: "relative",
            minHeight: "300px", // Ensures enough space for the loader
          }}
        >
          {(loading || searchLoading) && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 2,
              }}
            >
              <LoadingIndicator message="Loading products, please wait..." />
            </Box>
          )}

          {/* Products or Error */}
          {error ? (
            <Typography color="error" align="center">
              {error}
            </Typography>
          ) : (
            <Grid
              container
              spacing={3}
              sx={{ opacity: loading || searchLoading ? 0.5 : 1 }}
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.productName}>
                    <Productcard
                      productName={product.productName}
                      description={product.description}
                      price={product.price}
                      image={product.image}
                    />
                  </Grid>
                ))
              ) : (
                <Typography variant="h6" align="center" sx={{ width: "100%" }}>
                  No products found!
                </Typography>
              )}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Add New Product Modal */}
      {isOwner && (
        <AddNewProduct
          open={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
          onProductAdded={fetchProducts}
          storeId={storeId!}
        />
      )}
    </Box>
  );
};

export default Products;
