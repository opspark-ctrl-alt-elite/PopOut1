import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  isFree: boolean;
  isKidFriendly: boolean;
  isSober: boolean;
  vendor: { businessName: string };
};

const EventsFeed: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    isFree: false,
    isKidFriendly: false,
    isSober: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get('/api/categories');
    setCategories(res.data.map((cat: any) => cat.name));
  };

  const fetchEvents = async () => {
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.isFree) params.isFree = true;
      if (filters.isKidFriendly) params.isKidFriendly = true;
      if (filters.isSober) params.isSober = true;

      const res = await axios.get('/api/events', { params });
      const data = res.data;

      if (Array.isArray(data)) {
        setEvents(data);
      } else if (Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        console.warn('Unexpected response shape:', data);
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching public events:', err);
      setEvents([]);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Events Near You
      </Typography>

      {/* Filters */}
      <Stack spacing={2} direction="row" flexWrap="wrap" mb={4}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={filters.isFree}
              onChange={(e) => setFilters((f) => ({ ...f, isFree: e.target.checked }))}
            />
          }
          label="Free"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={filters.isKidFriendly}
              onChange={(e) => setFilters((f) => ({ ...f, isKidFriendly: e.target.checked }))}
            />
          }
          label="Kid-Friendly"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={filters.isSober}
              onChange={(e) => setFilters((f) => ({ ...f, isSober: e.target.checked }))}
            />
          }
          label="Sober"
        />

        <Button onClick={fetchEvents} variant="contained">
          Apply Filters
        </Button>
      </Stack>

      {/* Event List */}
      <Stack spacing={3}>
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent>
              <Typography variant="h6">{event.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Hosted by {event.vendor?.businessName}
              </Typography>
              <Typography variant="body2">{event.venue_name}</Typography>
              <Typography variant="body2">
                {new Date(event.startDate).toLocaleString()} –{' '}
                {new Date(event.endDate).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                {event.isFree && 'Free'} {event.isKidFriendly && '· Kid-Friendly'}{' '}
                {event.isSober && '· Sober'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default EventsFeed;
