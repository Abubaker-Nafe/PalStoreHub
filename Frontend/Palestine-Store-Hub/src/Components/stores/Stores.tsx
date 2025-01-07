import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LoadingIndicator from "../UI/LoadingIndicator";
import StoreCard from "./Storecard";
import { useStoreContext } from "../context/StoreContext";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export const Stores: React.FC = () => {
  const { stores, loading, error, fetchStores } = useStoreContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredStores, setFilteredStores] = useState(stores);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Update filteredStores when stores change
  useEffect(() => {
    setFilteredStores(stores);
  }, [stores]);

  // Handle input change for search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search logic
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      fetchStores(); // Refetch all stores
      setFilteredStores(stores);
      return;
    }

    setSearchLoading(true);
    const searchUrl = `https://pal-store-api.azurewebsites.net/api/stores/SearchStores?name=${encodeURIComponent(
      searchQuery
    )}`;

    try {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error("No stores found for the given name.");
      }
      const searchResults = await response.json();
      setFilteredStores(searchResults); // Update filtered stores
    } catch {
      setFilteredStores([]); // Clear results if an error occurs
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle Enter key press in search box
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search input and reset stores
  const handleClearSearch = () => {
    setSearchQuery("");
    fetchStores(); // Reset to all stores
  };

  return (
    <Box sx={{ marginTop: 10 }}>
      {/* Introductory Section */}
      <Container maxWidth="md" sx={{ textAlign: "center", marginBottom: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Palestine Store Hub
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", marginBottom: 4 }}
        >
          Discover and explore all the amazing stores across Palestine. Filter
          by town, search by category, and find the nearest store to your
          location with ease.
        </Typography>
      </Container>

      {/* Search Box */}
      <Container maxWidth="md" sx={{ marginBottom: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <TextField
            fullWidth
            placeholder="Search for stores..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
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
            onClick={!searchLoading ? handleSearch : undefined} // Prevent redundant clicks
            sx={{
              backgroundColor: searchLoading ? "#1976d2" : "#1976d2", // Maintain the same primary color
              color: "#fff", // Keep text white
              opacity: searchLoading ? 0.7 : 1, // Reduce opacity slightly during loading
              pointerEvents: searchLoading ? "none" : "auto", // Prevent clicks
              "&:hover": {
                backgroundColor: searchLoading ? "#1976d2" : "#115293", // Consistent hover color
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
      </Container>

      {/* Store Cards Section with Loading Overlay */}
      <Box
        sx={{
          position: "relative", // Relative positioning for the loader
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
              backgroundColor: "rgba(255, 255, 255, 0.8)", // Slight transparency
              zIndex: 2,
            }}
          >
            <LoadingIndicator message="Loading stores, please wait..." />
          </Box>
        )}

        {/* Store Cards or Error */}
        {error ? (
          <Typography color="error" variant="h6" align="center">
            {error}
          </Typography>
        ) : (
          <Container maxWidth="lg">
            <Grid
              container
              spacing={3}
              sx={{ opacity: loading || searchLoading ? 0.5 : 1 }}
            >
              {filteredStores && filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={store.id}>
                    <StoreCard
                      id={store.id}
                      name={store.name}
                      rating={store.rating}
                      address={store.location.address}
                      city={store.location.city}
                      image={store.image}
                      isOwner={false}
                    />
                  </Grid>
                ))
              ) : (
                <Typography variant="h6" align="center" sx={{ width: "100%" }}>
                  No stores found for the given search term.
                </Typography>
              )}
            </Grid>
          </Container>
        )}
      </Box>
    </Box>
  );
};
