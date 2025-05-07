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
          display: {
            xs: "flex",
            md: "grid",
          },
          gridTemplateColumns: {
            md: "repeat(5, 1fr)",
          },
          gap: 2,
          overflowX: {
            xs: "auto",
            md: "unset",
          },
          scrollSnapType: {
            xs: "x mandatory",
            md: "none",
          },
          "& > *": {
            scrollSnapAlign: {
              xs: "start",
              md: "unset",
            },
          },
          pb: 1,
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
              minWidth: { xs: 240, md: "auto" },
              flex: { xs: "0 0 auto", md: "unset" },
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
              <CardContent sx={{ pt: 2 }}>
                {/* number avatar */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  sx={{ mb: 0.5 }}
                >
                  <Typography
                    sx={{
                      fontFamily: `'Bebas Neue', sans-serif`,
                      fontSize: "4.6rem",
                      fontWeight: 900,
                      color: "black",
                      textShadow: "1px 1px 2px rgba(255, 255, 255, 0.89)",
                      lineHeight: 1,
                    }}
                  >
                    {index + 1}
                  </Typography>

                  <Avatar
                    src={vendor.uploadedImage}
                    alt={vendor.businessName}
                    sx={{ width: 80, height: 80 }}
                  />
                </Stack>

                {/* vendor name */}
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{
                    fontSize: "1rem",
                    wordBreak: "break-word",
                    maxWidth: "100%",
                  }}
                >
                  {vendor.businessName}
                </Typography>

                {/* rating */}
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ mt: 0.5 }}
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
