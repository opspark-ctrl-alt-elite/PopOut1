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
        const res = await axios.get("/vendors/spotlight/top5");

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

      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
          pb: 1,
          scrollSnapType: "x mandatory",
          "& > *": {
            scrollSnapAlign: "start",
          },
          "&::-webkit-scrollbar": { display: "none" },
          "-ms-overflow-style": "none",
          scrollbarWidth: "none",
        }}
      >
        {topVendors.map((vendor, index) => (
          <Box
            key={vendor.id}
            component={Link}
            to={`/vendor/${vendor.id}`}
            sx={{
              textDecoration: "none",
              color: "inherit",
              minWidth: 240,
              flex: "0 0 auto",
            }}
          >
            <Card
              sx={{
                borderRadius: 2,
                height: "100%",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2, pl: 6 }}
                >
                  <Box sx={{ position: "relative", width: 70, height: 60 }}>
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
                        xs: "0.9rem",
                        sm: "1rem",
                        md: "1.05rem",
                      },
                      wordBreak: "break-word",
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
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default TopVendorSpotlight;
