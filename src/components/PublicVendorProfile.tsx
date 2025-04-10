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
  Avatar,
  IconButton,
  Button,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';

import Navbar from './NavBar';

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

type Vendor = {
  businessName: string;
  description: string;
  profilePicture?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  email?: string;
};

const PublicVendorProfile: React.FC<Props> = ({ user }) => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    const fetchVendorEvents = async () => {
      try {
        const res = await axios.get(`/api/events/vendor/${vendorId}`);
        setEvents(res.data);
      } catch (err) {
        console.error('err fetching vendor events', err);
        setEvents([]);
      }
    };

    const fetchVendorInfo = async () => {
      try {
        const res = await axios.get(`/api/vendor/public/${vendorId}`);
        setVendor(res.data);
      } catch (err) {
        console.error('err fetching vendor info', err);
        setVendor(null);
      }
    };


    const checkFollowStatus = async () => {
      // axios
      setIsFollowing(false);
    };

    if (vendorId) {
      fetchVendorEvents();
      fetchVendorInfo();
      if (user) checkFollowStatus();
      setLoading(true);
      setTimeout(() => setLoading(false), 300);
    }
  }, [vendorId, user]);

  const handleFollowToggle = () => {
    if (!user) return;

    if (isFollowing) {
      //axios
      setIsFollowing(false);
    } else {
      // axios
      setIsFollowing(true);
    }
  };

  return (
    <>
      <Navbar user={user} />

      <Box sx={{ p: 4 }}>
        {vendor && (
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={vendor.profilePicture}
                alt={vendor.businessName}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {vendor.businessName}
                </Typography>
                {vendor.email && (
                  <Typography variant="body2" color="text.secondary">
                    {vendor.email}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              {vendor.facebook && (
                <IconButton component="a" href={vendor.facebook} target="_blank">
                  <FacebookIcon color="primary" />
                </IconButton>
              )}
              {vendor.instagram && (
                <IconButton component="a" href={vendor.instagram} target="_blank">
                  <InstagramIcon sx={{ color: '#d62976' }} />
                </IconButton>
              )}
              {vendor.website && (
                <IconButton component="a" href={vendor.website} target="_blank">
                  <LanguageIcon sx={{ color: '#4caf50' }} />
                </IconButton>
              )}
              {user && (
                <Button
                  variant="outlined"
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'} Vendor
                </Button>
              )}
            </Stack>
          </Stack>
        )}

        {vendor?.description && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            {vendor.description}
          </Typography>
        )}

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
    </>
  );
};

export default PublicVendorProfile;
