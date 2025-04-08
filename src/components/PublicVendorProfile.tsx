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

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
};

const PublicVendorProfile: React.FC = () => {
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
    </Box>
  );
};

export default PublicVendorProfile;