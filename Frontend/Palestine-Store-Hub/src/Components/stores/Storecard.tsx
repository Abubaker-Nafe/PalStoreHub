import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  CardMedia,
} from "@mui/material";
import StarRatings from "react-star-ratings";
import { useNavigate } from "react-router-dom";

type StoreProps = {
  id: string;
  name: string;
  rating: number;
  address: string;
  city: string;
  image: string;
  isOwner?: boolean; // New prop to check if the user is the store owner
};

const StoreCard: React.FC<StoreProps> = ({
  id,
  name,
  address,
  city,
  image,
  isOwner = false, // Default is false
}) => {
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState<number>(0);

  useEffect(() => {
    // Load user rating from local storage
    const storedRating = localStorage.getItem(`store-rating-${id}`);
    if (storedRating) {
      setUserRating(parseFloat(storedRating));
    }
  }, [id]);

  const handleRatingChange = (newRating: number) => {
    setUserRating(newRating);
    localStorage.setItem(`store-rating-${id}`, newRating.toString());
  };

  return (
    <Card
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "10px",
        boxShadow: 3,
        "&:hover": {
          boxShadow: 20, // Hover effect with a stronger shadow
        },
        transition: "box-shadow 0.3s ease-in-out",
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={`data:image/jpeg;base64,${image}`}
        alt={name}
        sx={{
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
        }}
      />
      <CardContent sx={{ padding: 3 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            textAlign: "left",
            fontWeight: "bold",
            fontSize: 25,
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ textAlign: "left", fontSize: 15 }}
        >
          {address}, {city}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ textAlign: "center", marginTop: 2, fontSize: 15 }}
        >
          Rating:
        </Typography>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
          <StarRatings
            rating={userRating}
            starRatedColor="gold"
            starHoverColor="gold"
            changeRating={handleRatingChange}
            numberOfStars={5}
            name={`rating-${id}`}
            starDimension="25px"
            starSpacing="5px"
          />
        </div>
      </CardContent>
      <CardActions sx={{ justifyContent: "center", padding: 2 }}>
        <Button
          size="small"
          sx={{
            width: "100%",
            color: "white",
            backgroundColor: "#343a40",
            fontSize: "15px",
            borderRadius: 3,
            "&:hover": {
              backgroundColor: "#495057",
            },
          }}
          onClick={() =>
            navigate(`/products/${id}`, {
              state: { isOwner }, // Pass isOwner to the products page
            })
          }
        >
          View Products
        </Button>
      </CardActions>
    </Card>
  );
};

export default StoreCard;
