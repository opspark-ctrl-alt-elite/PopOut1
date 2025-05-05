import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  CircularProgress,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
  AlertTitle,
  styled
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Upload as UploadIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ChildCare as ChildCareIcon,
  FreeBreakfast as FreeBreakfastIcon,
  Paid as PaidIcon
} from '@mui/icons-material';

const libraries: 'places'[] = ['places'];

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: theme.palette.grey[300]
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main
    }
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none'
  }
}));

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries
  });

  const [form, setForm] = useState<any>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    success: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const [eventRes, categoriesRes] = await Promise.all([
          axios.get('/api/events', { withCredentials: true }),
          axios.get('/api/categories')
        ]);
        const event = eventRes.data.find((e: any) => e.id === id);
        if (!event) {
          setModal({
            open: true,
            title: 'Error',
            message: 'Event not found',
            success: false
          });
          return;
        }
        const catNames = (event.Categories ?? event.categories ?? []).map(
          (c: any) => c.name
        );

        setForm({
          ...event,
          location: event.location || '',
          categories: catNames, // ✅ now pre‑selects chips
          image_publicId: event.image_publicId || ''
        });
        setAvailableCategories(categoriesRes.data.map((cat: any) => cat.name));
      } catch (err) {
        console.error('Failed to fetch event or categories:', err);
        setModal({
          open: true,
          title: 'Error',
          message: 'Failed to load event data',
          success: false
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.title) newErrors.title = 'Title is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (!form.venue_name) newErrors.venue_name = 'Venue is required';
    if (!form.location) newErrors.location = 'Location is required';
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <= new Date(form.startDate)
    ) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setForm((prev: any) => {
      const alreadySelected = prev.categories.includes(category);
      return {
        ...prev,
        categories: alreadySelected
          ? prev.categories.filter((c: string) => c !== category)
          : [...prev.categories, category]
      };
    });
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (place && location) {
      setForm((prev: any) => ({
        ...prev,
        location: place.formatted_address || '',
        latitude: location.lat().toString(),
        longitude: location.lng().toString()
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imageUpload', file);

    try {
      const endpoint = form.image_publicId
        ? `/api/images/${form.image_publicId}`
        : `/api/images/event/${id}`;
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadResult = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      setForm((prev: any) => ({
        ...prev,
        image_url: uploadResult.secure_url || uploadResult.url,
        image_publicId: uploadResult.public_id || prev.image_publicId
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setModal({
        open: true,
        title: 'Upload Failed',
        message: 'There was an error uploading your image. Please try again.',
        success: false
      });
    }
  };

  const handleDeleteImage = async () => {
    if (!form.image_publicId) return;
    try {
      await axios.delete('/api/images', {
        data: { publicIds: [form.image_publicId] }
      });
      setForm((prev: any) => ({
        ...prev,
        image_url: '',
        image_publicId: ''
      }));
    } catch (err) {
      console.error('Error deleting image:', err);
      setModal({
        open: true,
        title: 'Delete Failed',
        message: 'Failed to delete image. Please try again.',
        success: false
      });
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setModal({
        open: true,
        title: 'Form Errors',
        message: 'Please fix the errors in the form before submitting.',
        success: false
      });
      return;
    }
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      };
      await axios.put(`/api/events/${id}`, payload, { withCredentials: true });
      setModal({
        open: true,
        title: 'Success',
        message: 'Event updated!',
        success: true
      });
    } catch (err) {
      console.error('Error updating event:', err);
      setModal({
        open: true,
        title: 'Error',
        message: 'Error updating event.',
        success: false
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleModalClose = () => {
    setModal((prev: any) => ({ ...prev, open: false }));
    if (modal.success) navigate('/active-events');
  };

  if (loadError) {
    return (
      <Container maxWidth='md' sx={{ mt: 4 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          <AlertTitle>Google Maps Error</AlertTitle>
          Failed to load Google Maps functionality. Please refresh the page or
          try again later.
        </Alert>
      </Container>
    );
  }

  if (!isLoaded || loading || !form) {
    return (
      <Container
        maxWidth='md'
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh'
        }}
      >
        <Stack alignItems='center' spacing={2}>
          <CircularProgress size={60} />
          <Typography variant='h6'>Loading Event Editor...</Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth='md' sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Typography variant='h4' gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Edit Event
          </Typography>

          <Alert severity='info' icon={<InfoIcon />} sx={{ mb: 3 }}>
            Fields marked with * are required. All changes are subject to
            review.
          </Alert>

          <Stack spacing={4}>
            {/* Image Upload Section */}
            <Box>
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Event Image
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Upload a high-quality image that represents your event (JPEG,
                PNG, GIF, max 5MB)
              </Typography>

              <Box>
                <StyledButton
                  variant='contained'
                  component='label'
                  startIcon={<UploadIcon />}
                  disabled={uploading}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    },
                    '&:disabled': {
                      backgroundColor: 'grey.300'
                    }
                  }}
                >
                  {form.image_url ? 'Replace Image' : 'Upload Image'}
                  <input
                    type='file'
                    hidden
                    accept='image/*'
                    onChange={handleImageUpload}
                  />
                </StyledButton>

                {form.image_url && (
                  <Box sx={{ position: 'relative', mt: 2 }}>
                    <img
                      src={form.image_url}
                      alt='Event preview'
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                    <IconButton
                      onClick={() => {
                        setModal({
                          open: true,
                          title: 'Confirm Delete',
                          message:
                            'Are you sure you want to delete this image?',
                          success: false,
                          onConfirm: handleDeleteImage
                        });
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Basic Info Section */}
            <Box>
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Basic Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    name='title'
                    label='Event Title *'
                    value={form.title}
                    onChange={handleChange}
                    error={!!errors.title}
                    helperText={errors.title}
                    fullWidth
                    variant='outlined'
                  />
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    name='description'
                    label='Description *'
                    value={form.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    fullWidth
                    multiline
                    rows={4}
                    variant='outlined'
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Date & Time Section */}
            <Box>
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Date & Time
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label='Start Date & Time *'
                    value={form.startDate ? new Date(form.startDate) : null}
                    onChange={newValue =>
                      setForm((prev: any) => ({
                        ...prev,
                        startDate: newValue ? newValue.toISOString() : ''
                      }))
                    }
                    renderInput={params => (
                      <StyledTextField
                        {...params}
                        fullWidth
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label='End Date & Time *'
                    value={form.endDate ? new Date(form.endDate) : null}
                    onChange={newValue =>
                      setForm((prev: any) => ({
                        ...prev,
                        endDate: newValue ? newValue.toISOString() : ''
                      }))
                    }
                    minDateTime={
                      form.startDate ? new Date(form.startDate) : undefined
                    }
                    renderInput={params => (
                      <StyledTextField
                        {...params}
                        fullWidth
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Location Section */}
            <Box>
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Location
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    name='venue_name'
                    label='Venue Name *'
                    value={form.venue_name}
                    onChange={handleChange}
                    error={!!errors.venue_name}
                    helperText={errors.venue_name}
                    fullWidth
                    variant='outlined'
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    onLoad={a => (autocompleteRef.current = a)}
                    onPlaceChanged={handlePlaceChanged}
                  >
                    <StyledTextField
                      label='Location *'
                      name='location'
                      value={form.location}
                      onChange={handleChange}
                      error={!!errors.location}
                      helperText={errors.location || 'Type to search...'}
                      fullWidth
                      variant='outlined'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton edge='end'>
                              <img
                                src='https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png'
                                alt='Powered by Google'
                                style={{ height: '16px' }}
                              />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Autocomplete>
                </Grid>
              </Grid>
            </Box>

            {/* Event Features */}
            <Box>
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Event Features
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: form.isFree ? 'primary.main' : 'grey.200'
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          name='isFree'
                          checked={form.isFree}
                          onChange={handleChange}
                          icon={<PaidIcon />}
                          checkedIcon={<FreeBreakfastIcon color='success' />}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant='body1' fontWeight={600}>
                            Free Event
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            No admission fee
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%' }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: form.isKidFriendly
                        ? 'primary.main'
                        : 'grey.200'
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          name='isKidFriendly'
                          checked={form.isKidFriendly}
                          onChange={handleChange}
                          icon={<ChildCareIcon />}
                          checkedIcon={<ChildCareIcon color='success' />}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant='body1' fontWeight={600}>
                            Kid-Friendly
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Suitable for children
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%' }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: form.isSober ? 'primary.main' : 'grey.200'
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          name='isSober'
                          checked={form.isSober}
                          onChange={handleChange}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant='body1' fontWeight={600}>
                            Sober Event
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            No alcohol served
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%' }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Categories Section */}
            {availableCategories.length > 0 && (
              <Box>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Categories
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Select all that apply
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableCategories.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      clickable
                      variant={
                        form.categories.includes(category)
                          ? 'filled'
                          : 'outlined'
                      }
                      color={
                        form.categories.includes(category)
                          ? 'primary'
                          : 'default'
                      }
                      onClick={() => handleCategoryToggle(category)}
                      sx={{
                        borderRadius: 1,
                        px: 1,
                        py: 1.5,
                        fontSize: '0.875rem',
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                pt: 2
              }}
            >
              <StyledButton
                variant='contained'
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                sx={{
                  backgroundColor: '#b71c1c',
                  color: '#fff',
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  px: 2,
                  py: 0.5,
                  boxShadow: 1,
                  '&:hover': {
                    backgroundColor: '#fbe9e7',
                    borderColor: '#b71c1c',
                    color: '#b71c1c'
                  }
                }}
              >
                Cancel
              </StyledButton>

              <StyledButton
                variant='contained'
                onClick={handleSubmit}
                disabled={uploading}
                startIcon={<CheckCircleIcon />}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.300'
                  }
                }}
              >
                Update Event
              </StyledButton>
            </Box>
          </Stack>
        </Paper>

        {/* Success/Error Modal */}
        <Dialog
          open={modal.open}
          onClose={handleModalClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: '400px'
            }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: modal.success ? 'success.main' : 'error.main'
            }}
          >
            {modal.success ? (
              <CheckCircleIcon color='success' fontSize='large' />
            ) : (
              <ErrorIcon color='error' fontSize='large' />
            )}
            {modal.title}
          </DialogTitle>

          <DialogContent>
            <DialogContentText>{modal.message}</DialogContentText>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            {modal.onConfirm ? (
              <>
                <StyledButton
                  variant='outlined'
                  onClick={handleModalClose}
                  sx={{
                    borderColor: 'grey.300',
                    color: 'text.primary'
                  }}
                >
                  Cancel
                </StyledButton>
                <StyledButton
                  variant='contained'
                  onClick={() => {
                    modal.onConfirm?.();
                    handleModalClose();
                  }}
                  sx={{
                    backgroundColor: 'error.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'error.dark'
                    }
                  }}
                >
                  Delete
                </StyledButton>
              </>
            ) : (
              <StyledButton
                fullWidth
                variant='contained'
                onClick={handleModalClose}
                sx={{
                  backgroundColor: modal.success
                    ? 'success.main'
                    : 'error.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: modal.success
                      ? 'success.dark'
                      : 'error.dark'
                  }
                }}
              >
                {modal.success ? 'View Events' : 'Got It'}
              </StyledButton>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default EditEvent;
