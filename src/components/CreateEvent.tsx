import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
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
    latitude: '',
    longitude: '',
    isFree: false,
    isKidFriendly: false,
    isSober: false,
    image_url: '',
    categories: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        categories: form.categories.split(',').map((cat) => cat.trim()),
      };
      await axios.post('/api/events', payload);
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
        <TextField name="title" label="Title" onChange={handleChange} fullWidth />
        <TextField name="description" label="Description" onChange={handleChange} fullWidth multiline />
        <TextField name="startDate" label="Start Date" type="datetime-local" onChange={handleChange} fullWidth />
        <TextField name="endDate" label="End Date" type="datetime-local" onChange={handleChange} fullWidth />
        <TextField name="venue_name" label="Venue" onChange={handleChange} fullWidth />
        <TextField name="latitude" label="Latitude" onChange={handleChange} fullWidth />
        <TextField name="longitude" label="Longitude" onChange={handleChange} fullWidth />
        <TextField name="image_url" label="Image URL" onChange={handleChange} fullWidth />
        <TextField name="categories" label="Categories (comma separated)" onChange={handleChange} fullWidth />
        <FormControlLabel control={<Checkbox name="isFree" onChange={handleChange} />} label="Free?" />
        <FormControlLabel control={<Checkbox name="isKidFriendly" onChange={handleChange} />} label="Kid-Friendly?" />
        <FormControlLabel control={<Checkbox name="isSober" onChange={handleChange} />} label="Sober?" />
        <Button variant="contained" onClick={handleSubmit}>Submit</Button>
      </Stack>
    </Container>
  );
};

export default CreateEvent;

