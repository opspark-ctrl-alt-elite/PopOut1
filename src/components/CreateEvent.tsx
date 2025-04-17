// CreateEvent.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const libraries: ("places")[] = ["places"];

const CreateEvent = () => {
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Only the Google Maps API key is needed on the client.
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

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
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    success: boolean;
  }>({ open: false, title: '', message: '', success: false });

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
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!form.venue_name) newErrors.venue_name = 'Venue is required';
    if (!form.location) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        categories: selected ? prev.categories.filter((c) => c !== category) : [...prev.categories, category],
      };
    });
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (place && location) {
      setForm((prev) => ({
        ...prev,
        location: place.formatted_address || '',
        latitude: location.lat().toString(),
        longitude: location.lng().toString(),
      }));
    }
  };

  // Modified image upload handler: POST to our server endpoint.
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    // Use the field name expected by your partner's route.
    formData.append('imageUpload', file);

    try {
      // POST to your server's image upload endpoint.
      // Here, we use "event" as the foreignKeyName and "new" as the foreignKey placeholder.
      const response = await axios.post('/api/images/event/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // The server returns an array of upload results.
      const uploadResult = response.data[0];
      // Set the event's image URL from Cloudinary.
      setForm(prev => ({ ...prev, image_url: uploadResult.secure_url || uploadResult.url }));
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setModal({ open: true, title: 'Error', message: 'Please fix the errors in the form.', success: false });
      return;
    }
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };
      await axios.post('/api/events', payload, { withCredentials: true });
      setModal({ open: true, title: 'Success', message: 'Event created!', success: true });
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: 'Error', message: 'Error creating event.', success: false });
    }
  };

  const handleModalClose = () => {
    setModal((prev) => ({ ...prev, open: false }));
    if (modal.success) {
      navigate('/active-events');
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          <DateTimePicker
            label="Start Date *"
            value={form.startDate ? new Date(form.startDate) : null}
            onChange={(newValue) =>
              setForm((prev) => ({
                ...prev,
                startDate: newValue ? newValue.toISOString() : '',
              }))
            }
            inputFormat="MM/dd/yyyy hh:mm aa"
            ampm
            onError={() => null}
            renderInput={(params) => (
              <TextField {...params} fullWidth error={!!errors.startDate} helperText={errors.startDate} />
            )}
          />
          <DateTimePicker
            label="End Date *"
            value={form.endDate ? new Date(form.endDate) : null}
            onChange={(newValue) =>
              setForm((prev) => ({
                ...prev,
                endDate: newValue ? newValue.toISOString() : '',
              }))
            }
            inputFormat="MM/dd/yyyy hh:mm aa"
            ampm
            onError={() => null}
            renderInput={(params) => (
              <TextField {...params} fullWidth error={!!errors.endDate} helperText={errors.endDate} />
            )}
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
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
          >
            <TextField
              label="Location *"
              value={form.location}
              onChange={handleChange}
              name="location"
              error={!!errors.location}
              helperText={errors.location || 'Start typing address...'}
              fullWidth
            />
          </Autocomplete>
          <Box>
            <Button variant="outlined" component="label">
              Upload Image
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>
            {form.image_url && (
              <Box mt={2}>
                <img
                  src={form.image_url}
                  alt="Event"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                />
              </Box>
            )}
          </Box>
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
        <Dialog
          open={modal.open}
          onClose={handleModalClose}
          hideBackdrop
          disableEnforceFocus
          aria-labelledby="notification-dialog-title"
          aria-describedby="notification-dialog-description"
        >
          <DialogTitle id="notification-dialog-title">{modal.title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="notification-dialog-description">
              {modal.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent;
