import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  IconButton,
} from "@mui/material";
import { Facebook, Twitter, Instagram } from "@mui/icons-material";
import EventsFeed from "./EventsFeed";
import TopVendorSpotlight from "./TopVendorSpotlight";

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
              const ratingRes = await axios.get(
                `/vendors/${vendor.id}/average-rating`
              );
              const avg = parseFloat(ratingRes.data.averageRating);
              return {
                ...vendor,
                averageRating: !isNaN(avg) ? avg : 0,
              };
            } catch (error) {
              console.error(
                `Error fetching rating for vendor ${vendor.id}:`,
                error
              );
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
      {/* Events */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box>
          <EventsFeed user={user} />
          <TopVendorSpotlight />
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: 4,
          backgroundColor: "#f0f0f0",
          borderTop: "1px solid #ddd",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {user && !user.is_vendor && (
              <Grid item xs={12} sm={6} textAlign="center">
                <Typography variant="h6" gutterBottom>
                  Want to host popups?
                </Typography>
                <Button
                  component={Link}
                  to="/vendor-signup"
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    backgroundColor: "#000",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#333" },
                  }}
                >
                  Become a Vendor
                </Button>
              </Grid>
            )}

            {user && (
              <Grid item xs={12} sm={6} textAlign="center">
                <Typography variant="h6" gutterBottom>
                  Just for fun?
                </Typography>
                <Button
                  component={Link}
                  to="/game"
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    backgroundColor: "#000",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#333" },
                  }}
                >
                  Play Game
                </Button>
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <IconButton aria-label="facebook">
              <Facebook />
            </IconButton>
            <IconButton aria-label="twitter">
              <Twitter />
            </IconButton>
            <IconButton aria-label="instagram">
              <Instagram />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
