// src/components/PublicVendorProfile.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Stack,
} from '@mui/material';

import Navbar from './NavBar';
import ReviewComponent from './Review';

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  } | null;
};

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
};

const PublicVendorProfile: React.FC<Props> = ({ user }) => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorEvents = async () => {
      try {
        const res = await axios.get(`/api/events/vendor/${vendorId}`);
        setEvents(res.data);
      } catch (err) {
        console.error('Error fetching vendor events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) fetchVendorEvents();
  }, [vendorId]);

  return (
    <>
      <Navbar user={user} />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Vendor Events
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : events.length === 0 ? (
          <Typography>No events</Typography>
        ) : (
          <Stack spacing={2}>
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.venue_name}
                  </Typography>
                  <Typography variant="body2">
                    {new Date(event.startDate).toLocaleString()} —{' '}
                    {new Date(event.endDate).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {event.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Reviews
          </Typography>
          {vendorId && (
            <>
              {user ? (
                <ReviewComponent vendorId={vendorId} currentUserId={user.id} />
              ) : (
                <Typography variant="body1">
                  Please sign in to add your review.
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default PublicVendorProfile;
