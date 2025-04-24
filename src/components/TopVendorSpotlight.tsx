import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Avatar,
  Stack,
  Rating,
  Grid,
  Container,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

interface VendorSpotlightData {
  id: string;
  businessName: string;
  profilePicture?: string;
  averageRating?: number;
  reviewCount?: number;
  uploadedImage?: string;
}

const TopVendorSpotlight: React.FC = () => {
  const [topVendors, setTopVendors] = useState<VendorSpotlightData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const theme = useTheme();

  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        const res = await axios.get("/vendors/spotlight/top3");

        const vendorData = await Promise.all(
          res.data.map(async (vendor: VendorSpotlightData) => {
            try {
              const [ratingRes, imageRes] = await Promise.all([
                axios.get(`/vendors/${vendor.id}/average-rating`),
                axios.get(`/api/images/vendorId/${vendor.id}`),
              ]);

              const uploadedImage =
                imageRes.data?.[0]?.referenceURL || vendor.profilePicture || "";

              return {
                ...vendor,
                averageRating: parseFloat(ratingRes.data.averageRating),
                reviewCount: parseInt(ratingRes.data.reviewCount, 10) || 0,
                uploadedImage,
              };
            } catch {
              return {
                ...vendor,
                averageRating: 0,
                reviewCount: 0,
                uploadedImage: vendor.profilePicture || "",
              };
            }
          })
        );

        setTopVendors(vendorData);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch top vendors.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopVendors();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!topVendors.length)
    return <Typography>No vendor spotlight available.</Typography>;

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{ px: { xs: 2, sm: 4 }, mt: 6 }}
    >
      <Typography variant="h4" gutterBottom>
        Vendor Spotlight
      </Typography>

      <Grid container spacing={2}>
        {topVendors.map((vendor, index) => (
          <Grid item xs={12} sm={6} md={3} key={vendor.id}>
            <Card
              sx={{
                maxWidth: 250,
                mx: "auto",
                borderRadius: 2,
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent
                component={Link}
                to={`/vendor/${vendor.id}`}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    mb: 2,
                    pl: 6,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 70,
                      height: 60,
                      display: "inline-block",
                    }}
                  >
                    <Avatar
                      src={vendor.uploadedImage}
                      alt={vendor.businessName}
                      sx={{ width: 60, height: 60 }}
                    />
                    <Typography
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "-2.0rem",
                        transform: "translateY(-50%)",
                        fontFamily: `'Bebas Neue', sans-serif`,
                        fontSize: {
                          xs: "3.6rem",
                          sm: "4rem",
                          md: "4.6rem",
                        },

                        fontWeight: 850,
                        color: "black",
                        lineHeight: 1,
                        textShadow: "1px 1px 2px rgba(255, 255, 255, 0.89)",
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      fontSize: {
                        xs: theme.typography.pxToRem(14),
                        sm: theme.typography.pxToRem(15),
                        md: theme.typography.pxToRem(16),
                      },
                      wordBreak: "break-word",
                      display: "block",
                    }}
                  >
                    {vendor.businessName}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ mt: 1 }}
                >
                  <Rating
                    value={vendor.averageRating || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    (
                    {vendor.reviewCount === 1
                      ? "1 review"
                      : `${vendor.reviewCount} reviews`}
                    )
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TopVendorSpotlight;
