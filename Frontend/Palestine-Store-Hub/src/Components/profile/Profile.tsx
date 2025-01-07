import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import AddNewStore from "../stores/AddNewStore";
import StoreCard from "../stores/Storecard";
import { Container, Paper, Typography, Avatar, Divider, Box } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";

// Styled Components
const Banner = styled(Box)(() => ({
  height: "300px",
  background: "linear-gradient(to bottom, #dee2e6, #ced4da, #adb5bd)", // Slightly darker grays
  backgroundSize: "100% 100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  color: "#212529", // Slightly darker gray for text
  boxShadow: "inset 0px -10px 15px rgba(0, 0, 0, 0.1)", // A bit stronger shadow for depth
  borderBottom: "1px solid #a9b0b5", // Darker border for contrast
}));

const SwiperContainer = styled(Box)(() => ({
  marginTop: "2rem",
  padding: "1rem 0",
}));

const AddStoreCard = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "320px", // Set a fixed height matching StoreCard
  border: "2px dashed #aaa",
  borderRadius: "10px",
  backgroundColor: "#f9f9f9",
  color: "#0078D7",
  transition: "background-color 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    backgroundColor: "#e6f7ff",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  },
}));

const Profile = () => {
  const { userData, userStores, fetchUserStores } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userData?.username) {
      fetchUserStores();
    }
  }, [userData?.username]);

  if (!userData) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
        No user data available. Please log in.
      </Typography>
    );
  }

  const profile = userData.profile || {};
  const profileImageSrc = profile.image
    ? `data:image/jpeg;base64,${profile.image}`
    : "https://via.placeholder.com/150";

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Banner>
        <Avatar
          alt={`${profile.firstName || "User"} ${profile.lastName || ""}`}
          src={profileImageSrc}
          sx={{
            width: 150,
            height: 150,
            position: "absolute",
            bottom: "-75px",
            border: "5px solid #ffffff",
          }}
        />
      </Banner>

      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight="bold" textAlign="center">
            {profile.firstName || "N/A"} {profile.lastName || ""}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" textAlign="center" sx={{ mb: 2 }}>
            {userData.roles?.join(", ") || "Store Owner"}
          </Typography>

          {/* Bio */}
          {profile.bio && (
            <Typography
              variant="body1"
              color="textSecondary"
              textAlign="center"
              sx={{ mb: 2 }}
            >
              {profile.bio}
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Stores Section */}
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            My Stores
          </Typography>

          <SwiperContainer>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={3}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                0: { slidesPerView: 1 },
                600: { slidesPerView: 2 },
                960: { slidesPerView: 3 },
              }}
            >
              {/* Display all existing stores */}
              {userStores?.map((store) => (
                <SwiperSlide key={store.id}>
                  <Box height="100%">
                    <StoreCard
                      id={store.id}
                      name={store.name}
                      rating={store.rating}
                      address={store.location.address}
                      city={store.location.city}
                      image={store.image}
                      isOwner={true}
                    />
                  </Box>
                </SwiperSlide>
              ))}

              {/* Add New Store card */}
              <SwiperSlide>
                <Box height="100%">
                  <AddStoreCard onClick={() => setIsModalOpen(true)}>
                    <AddIcon sx={{ fontSize: 60 }} />
                    <Typography
                      variant="body1"
                      sx={{ mt: 1, fontWeight: "bold", color: "#0078D7" }}
                    >
                      Add New Store
                    </Typography>
                  </AddStoreCard>
                </Box>
              </SwiperSlide>
            </Swiper>
          </SwiperContainer>
        </Paper>
      </Container>

      {/* Add New Store Modal */}
      <AddNewStore
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStoreAdded={fetchUserStores}
      />
    </Box>
  );
};

export default Profile;
