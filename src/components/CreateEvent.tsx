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
  Box,
  Divider,
  CircularProgress,
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
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    success: false,
  });

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imageUpload', file);

    try {
      setUploading(true);
      const response = await axios.post('/api/images/event/new', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadResult = response.data[0];
      setForm((prev) => ({ ...prev, image_url: uploadResult.secure_url || uploadResult.url }));
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setUploading(false);
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
      setModal({ open: true, title: 'Success', message: 'Popup created!', success: true });
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: 'Error', message: 'Error creating popup.', success: false });
    }
  };

  const handleModalClose = () => {
    setModal((prev) => ({ ...prev, open: false }));
    if (modal.success) navigate('/active-events');
  };

  if (!isLoaded) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Create Popup</Typography>

        <Stack spacing={3}>
          <TextField
            name="title"
            label="Popup Title *"
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
            multiline
            rows={4}
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <DateTimePicker
              label="Start Date *"
              value={form.startDate ? new Date(form.startDate) : null}
              onChange={(val) => setForm(prev => ({ ...prev, startDate: val ? val.toISOString() : '' }))}
              renderInput={(params) => (
                <TextField {...params} fullWidth error={!!errors.startDate} helperText={errors.startDate} />
              )}
            />
            <DateTimePicker
              label="End Date *"
              value={form.endDate ? new Date(form.endDate) : null}
              onChange={(val) => setForm(prev => ({ ...prev, endDate: val ? val.toISOString() : '' }))}
              renderInput={(params) => (
                <TextField {...params} fullWidth error={!!errors.endDate} helperText={errors.endDate} />
              )}
            />
          </Stack>

          <TextField
            name="venue_name"
            label="Venue *"
            value={form.venue_name}
            onChange={handleChange}
            error={!!errors.venue_name}
            helperText={errors.venue_name}
            fullWidth
          />

          <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={handlePlaceChanged}>
            <TextField
              label="Location *"
              name="location"
              value={form.location}
              onChange={handleChange}
              error={!!errors.location}
              helperText={errors.location || 'Type to search...'}
              fullWidth
            />
          </Autocomplete>

          <Box>
            <Button
              variant="contained"
              size="small"
              component="label"
              sx={{ mt: 2 }}
            >
              Upload Popup Image
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>
            {uploading && <Typography mt={1}>Uploading...</Typography>}
            {form.image_url && (
              <Box mt={2}>
                <img
                  src={form.image_url}
                  alt="Popup"
                  style={{ width: '100%', maxHeight: 250, objectFit: 'cover' }}
                />
              </Box>
            )}
          </Box>

          <Divider />

          <FormGroup row>
            <FormControlLabel control={<Checkbox name="isFree" checked={form.isFree} onChange={handleChange} />} label="Free" />
            <FormControlLabel control={<Checkbox name="isKidFriendly" checked={form.isKidFriendly} onChange={handleChange} />} label="Kid-Friendly" />
            <FormControlLabel control={<Checkbox name="isSober" checked={form.isSober} onChange={handleChange} />} label="Sober" />
          </FormGroup>

          <Divider />

          {availableCategories.length > 0 && (
            <>
              <FormLabel>Categories</FormLabel>
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

          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Stack>

        <Dialog open={modal.open} onClose={handleModalClose}>
          <DialogTitle>{modal.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{modal.message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleModalClose}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent;
