import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Avatar,
  Stack,
  Rating,
} from '@mui/material';
import { Link } from 'react-router-dom';

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
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        const res = await axios.get('/vendors/spotlight/top3');

        const vendorData = await Promise.all(
          res.data.map(async (vendor: VendorSpotlightData) => {
            try {
              const [ratingRes, imageRes] = await Promise.all([
                axios.get(`/vendors/${vendor.id}/average-rating`),
                axios.get(`/api/images/vendorId/${vendor.id}`),
              ]);

              const uploadedImage = imageRes.data?.[0]?.referenceURL || vendor.profilePicture || '';

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
                uploadedImage: vendor.profilePicture || '',
              };
            }
          })
        );

        setTopVendors(vendorData);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch top vendors.');
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
    <Box sx={{ my: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Vendor Spotlight
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc',
            borderRadius: 4,
          },
        }}
      >
        {topVendors.map((vendor, index) => (
          <Card
            key={vendor.id}
            sx={{
              minWidth: 200,
              flexShrink: 0,
              borderRadius: 2,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent
              component={Link}
              to={`/vendor/${vendor.id}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                >
                  {index + 1}
                </Typography>
                <Avatar
                  src={vendor.uploadedImage}
                  alt={vendor.businessName}
                  sx={{ width: 48, height: 48 }}
                />
                <Typography variant="subtitle1" fontWeight="bold">
                  {vendor.businessName}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Rating
                  value={vendor.averageRating || 0}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  (
                  {vendor.reviewCount === 1
                    ? '1 review'
                    : `${vendor.reviewCount} reviews`}
                  )
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default TopVendorSpotlight;
