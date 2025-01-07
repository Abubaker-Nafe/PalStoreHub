import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardActions,
  CardMedia,
} from "@mui/material";

type ProductProps = {
  productName: string;
  description: string;
  price: number;
  image: string;
};

export const Productcard: React.FC<ProductProps> = ({
  productName,
  description,
  price,
  image,
}) => {
  return (
    <Box sx={{ width: "100%", maxWidth: 280 }}>
      <Card>
        <CardMedia
          component="img"
          height="200"
          image={`data:image/jpeg;base64,${image}`}
          alt={`${productName} image`}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{ textAlign: "left", fontWeight: "bold" }}
          >
            {productName}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "left", marginBottom: 1 }}
          >
            {description}
          </Typography>
          <Typography
            variant="body2"
            color="black"
            sx={{ fontWeight: "bold", textAlign: "left", fontSize: "20px" }}
          >
            ${price.toFixed(2)}
          </Typography>
        </CardContent>
        <CardActions>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          </Box>
        </CardActions>
      </Card>
    </Box>
  );
};
