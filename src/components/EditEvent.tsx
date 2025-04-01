import React, { useEffect, useState } from 'react';
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
import { useParams, useNavigate } from 'react-router-dom';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/events`);
        const event = res.data.events.find((e: any) => e.id === id);
        if (!event) {
          alert('Event not found');
          return;
        }
        setForm({
          ...event,
          categories: '', // optional
        });
      } catch (err) {
        console.error('Failed to fetch event:', err);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        categories: form.categories
          ? form.categories.split(',').map((cat: string) => cat.trim())
          : [],
      };
      await axios.put(`http://localhost:3000/events/${id}`, payload);
      alert('Event updated!');
      navigate('/active-events');
    } catch (err) {
      console.error(err);
      alert('Error updating event.');
    }
  };

  if (!form) return <Typography>Loading...</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Edit Event</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField name="title" label="Title" value={form.title} onChange={handleChange} fullWidth />
        <TextField name="description" label="Description" value={form.description} onChange={handleChange} fullWidth multiline />
        <TextField name="startDate" label="Start Date" type="datetime-local" value={form.startDate} onChange={handleChange} fullWidth />
        <TextField name="endDate" label="End Date" type="datetime-local" value={form.endDate} onChange={handleChange} fullWidth />
        <TextField name="venue_name" label="Venue" value={form.venue_name} onChange={handleChange} fullWidth />
        <TextField name="latitude" label="Latitude" value={form.latitude} onChange={handleChange} fullWidth />
        <TextField name="longitude" label="Longitude" value={form.longitude} onChange={handleChange} fullWidth />
        <TextField name="image_url" label="Image URL" value={form.image_url} onChange={handleChange} fullWidth />
        <TextField name="categories" label="Categories (comma separated)" value={form.categories} onChange={handleChange} fullWidth />
        <FormControlLabel control={<Checkbox name="isFree" checked={form.isFree} onChange={handleChange} />} label="Free?" />
        <FormControlLabel control={<Checkbox name="isKidFriendly" checked={form.isKidFriendly} onChange={handleChange} />} label="Kid-Friendly?" />
        <FormControlLabel control={<Checkbox name="isSober" checked={form.isSober} onChange={handleChange} />} label="Sober?" />
        <Button variant="contained" onClick={handleSubmit}>Update</Button>
      </Stack>
    </Container>
  );
};

export default EditEvent;
function alert(arg0: string) {
  throw new Error('Function not implemented.');
}

