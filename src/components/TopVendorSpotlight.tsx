// src/components/TopVendorSpotlight.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

interface VendorSpotlightData {
  id: string;
  businessName: string;
  email: string;
  description: string;
  // Include additional fields as needed.
  score: number;
}

const TopVendorSpotlight: React.FC = () => {
  const [topVendors, setTopVendors] = useState<VendorSpotlightData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch the top 3 vendors from the spotlight endpoint.
  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        const res = await axios.get('/vendors/spotlight/top3');
        setTopVendors(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch top vendors.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopVendors();
  }, []);

  // Set up an interval to alternate the current vendor every 15 seconds.
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => {
        return topVendors.length ? (prevIndex + 1) % topVendors.length : 0;
      });
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [topVendors]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!topVendors.length) return <Typography>No vendor spotlight available.</Typography>;

  const currentVendor = topVendors[currentIndex];

  return (
    <Card sx={{ my: 4, maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Vendor Spotlight
        </Typography>
        <Typography variant="h5">
          {currentVendor.businessName}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {currentVendor.description}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Score: {currentVendor.score}
        </Typography>
        <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
          Top 3 vendor spotlight rotates every 15 seconds.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TopVendorSpotlight;
