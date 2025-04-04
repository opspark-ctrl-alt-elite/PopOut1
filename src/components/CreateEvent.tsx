import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  FormGroup,
  FormLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    venue_name: '',
    location: '',
    latitude: '',
    longitude: '',
    isFree: false,
    isKidFriendly: false,
    isSober: false,
    image_url: '',
    categories: [] as string[],
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        setAvailableCategories(res.data.map((cat: any) => cat.name));
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.title) newErrors.title = 'Title is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!form.venue_name) newErrors.venue_name = 'Venue is required';
    if (!form.location) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mockGeocode = async (address: string) => {
    return {
      latitude: '37.7749',
      longitude: '-122.4194',
    };
  };

  const handleLocationBlur = async () => {
    if (!form.location) return;
    try {
      const coords = await mockGeocode(form.location);
      setForm((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setForm((prev) => {
      const selected = prev.categories.includes(category);
      return {
        ...prev,
        categories: selected
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category],
      };
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      await axios.post('/api/events', payload, { withCredentials: true });
      alert('Event created!');
      navigate('/active-events');
    } catch (err) {
      console.error(err);
      alert('Error creating event.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Create Event</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          name="title"
          label="Title *"
          value={form.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
          fullWidth
        />
        <TextField
          name="description"
          label="Description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          multiline
        />
        <TextField
          name="startDate"
          label="Start Date *"
          type="datetime-local"
          value={form.startDate}
          onChange={handleChange}
          error={!!errors.startDate}
          helperText={errors.startDate}
          fullWidth
        />
        <TextField
          name="endDate"
          label="End Date *"
          type="datetime-local"
          value={form.endDate}
          onChange={handleChange}
          error={!!errors.endDate}
          helperText={errors.endDate}
          fullWidth
        />
        <TextField
          name="venue_name"
          label="Venue *"
          value={form.venue_name}
          onChange={handleChange}
          error={!!errors.venue_name}
          helperText={errors.venue_name}
          fullWidth
        />
        <TextField
          name="location"
          label="Location *"
          value={form.location}
          onChange={handleChange}
          onBlur={handleLocationBlur}
          error={!!errors.location}
          helperText={errors.location || 'We’ll look up coordinates for you'}
          fullWidth
        />
        <TextField
          name="image_url"
          label="Image URL (optional)"
          value={form.image_url}
          onChange={handleChange}
          fullWidth
        />
        <FormControlLabel
          control={<Checkbox name="isFree" checked={form.isFree} onChange={handleChange} />}
          label="Free?"
        />
        <FormControlLabel
          control={<Checkbox name="isKidFriendly" checked={form.isKidFriendly} onChange={handleChange} />}
          label="Kid-Friendly?"
        />
        <FormControlLabel
          control={<Checkbox name="isSober" checked={form.isSober} onChange={handleChange} />}
          label="Sober?"
        />
        {availableCategories.length > 0 && (
          <>
            <FormLabel component="legend">Categories</FormLabel>
            <FormGroup row>
              {availableCategories.map((category) => (
                <FormControlLabel
                  key={category}
                  control={
                    <Checkbox
                      checked={form.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                  }
                  label={category}
                />
              ))}
            </FormGroup>
          </>
        )}
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </Stack>
    </Container>
  );
};

export default CreateEvent;
