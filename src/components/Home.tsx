import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import EventsFeed from "./EventsFeed";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  is_vendor: boolean;
};

type Vendors = {
  id: string;
  businessName: string;
  email: string;
  profilePicture?: string;
  description: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}[];

type Captcha = {
  beatCaptcha: boolean;
  wantsToBeVendor: boolean;
};

type SpotlightVendor = {
  id: string;
  businessName: string;
  description: string;
  averageRating: number;
};

type Props = {
  user: User | null;
  vendors: Vendors | null;
  captcha: Captcha;
  setCaptcha: Function;
};

const Home: React.FC<Props> = ({ user, vendors, captcha, setCaptcha }) => {
  const [spotlight, setSpotlight] = useState<SpotlightVendor[]>([]);

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        const res = await axios.get("/vendors/spotlight/top3", {
          withCredentials: true,
        });
        const spotlightData = Array.isArray(res.data) ? res.data : [];
        const spotlightWithRatings = await Promise.all(
          spotlightData.map(async (vendor: any) => {
            try {
              const ratingRes = await axios.get(`/vendors/${vendor.id}/average-rating`);
              const avg = parseFloat(ratingRes.data.averageRating);
              return {
                ...vendor,
                averageRating: !isNaN(avg) ? avg : 0,
              };
            } catch (error) {
              console.error(`Error fetching rating for vendor ${vendor.id}:`, error);
              return {
                ...vendor,
                averageRating: 0,
              };
            }
          })
        );
        setSpotlight(spotlightWithRatings);
      } catch (error) {
        console.error("Error fetching vendor spotlight:", error);
      }
    };
    fetchSpotlight();
  }, []);

  return (
    <Box>
      {/* events */}
      <Container sx={{ mt: 4 }}>
        <EventsFeed user={user} />
      </Container>

      {/* vendor spotlight */}
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Vendor Spotlight
        </Typography>
        {spotlight.length > 0 ? (
          spotlight.map((vendor) => (
            <Card key={vendor.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{vendor.businessName}</Typography>
                <Typography variant="body2">
                  Average Rating:{" "}
                  {typeof vendor.averageRating === "number"
                    ? vendor.averageRating.toFixed(1)
                    : "N/A"}
                </Typography>
                <Typography variant="body2">{vendor.description}</Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No vendors in spotlight.</Typography>
        )}
      </Container>

      {/* game/vendor signup */}
      <Container sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        {user && !user.is_vendor && (
          <Box mb={3}>
            <Button component={Link} to="/vendor-signup" variant="outlined" size="large">
              Become a Vendor
            </Button>
          </Box>
        )}
        {user && (
          <Box>
            <Button component={Link} to="/game" variant="outlined" size="large">
              Play Game
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;
