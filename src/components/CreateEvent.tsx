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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  CircularProgress,
  Chip,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
  AlertTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
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
  Paid as PaidIcon,
} from '@mui/icons-material';

// Constants
const libraries = ['places'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Styled components
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '& fieldset': { borderColor: theme.palette.grey[300] },
    '&:hover fieldset': { borderColor: theme.palette.primary.main },
  },
}));

const StyledButton = styled(Button)({
  borderRadius: 12,
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': { boxShadow: 'none' },
});

interface EventForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  location: string;
  latitude: string;
  longitude: string;
  isFree: boolean;
  isKidFriendly: boolean;
  isSober: boolean;
  image_url: string;
  categories: string[];
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Google Maps initialization
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // Form state
  const [form, setForm] = useState<EventForm>({
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
    categories: [],
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
  });

  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    success: false,
  });

  // Fetch available categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        setAvailableCategories(res.data.map((c: any) => c.name));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.title) newErrors.title = 'Title is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (form.description.length > 100) {
      newErrors.description = 'Description must be 100 characters or less';
    }
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

  // Handlers
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleCategory = (category: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    
    if (place && location) {
      setForm(prev => ({
        ...prev,
        location: place.formatted_address || '',
        latitude: location.lat().toString(),
        longitude: location.lng().toString(),
      }));
    }
  };

  // Image upload handlers
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET as string);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadState(prev => ({ ...prev, progress }));
          }
        },
      }
    );

    return response.data.secure_url;
  };

  const uploadToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET as string);

    const response = await axios.post('/api/images/event/new', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadState(prev => ({ ...prev, progress }));
        }
      },
    });

    return response.data[0]?.secure_url || response.data[0]?.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setModal({
        open: true,
        title: 'Invalid File',
        message: 'Please upload a JPEG, PNG, or GIF image.',
        success: false,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setModal({
        open: true,
        title: 'File Too Large',
        message: 'Maximum file size is 5MB.',
        success: false,
      });
      return;
    }

    try {
      setUploadState({ isUploading: true, progress: 0 });

      const uploadMethod = process.env.NODE_ENV === 'production' ? uploadToCloudinary : uploadToBackend;
      const imageUrl = await uploadMethod(file);

      setForm(prev => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error('Image upload failed:', error);
      setModal({
        open: true,
        title: 'Upload Failed',
        message: 'Unable to upload image. Please try again.',
        success: false,
      });
    } finally {
      setUploadState({ isUploading: false, progress: 0 });
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setModal({
        open: true,
        title: 'Form Errors',
        message: 'Please fix all errors before submitting.',
        success: false,
      });
      return;
    }

    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      await axios.post('/api/events', payload, { withCredentials: true });
      
      setModal({
        open: true,
        title: 'Success!',
        message: 'Your event has been created successfully.',
        success: true,
      });
    } catch (error) {
      console.error('Event creation failed:', error);
      setModal({
        open: true,
        title: 'Error',
        message: 'Failed to create event. Please try again.',
        success: false,
      });
    }
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, open: false }));
    if (modal.success) navigate('/active-events');
  };

  // Render guards
  if (loadError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <AlertTitle>Google Maps Error</AlertTitle>
          Could not load Google Maps. Please refresh the page and try again.
        </Alert>
      </Container>
    );
  }

  if (!isLoaded) {
    return (
      <Container maxWidth="md" sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6">Loading Event Creator...</Typography>
        </Stack>
      </Container>
    );
  }

  // Feature checkboxes configuration
  const featureOptions = [
    {
      key: 'isFree',
      label: 'Free Event',
      description: 'No admission fee',
      icon: <PaidIcon />,
      checkedIcon: <FreeBreakfastIcon color="success" />,
    },
    {
      key: 'isKidFriendly',
      label: 'Kid-Friendly',
      description: 'Suitable for children',
      icon: <ChildCareIcon />,
      checkedIcon: <ChildCareIcon color="success" />,
    },
    {
      key: 'isSober',
      label: 'Sober Event',
      description: 'No alcohol served',
      icon: <Checkbox />,
      checkedIcon: undefined,
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Create New Event
          </Typography>

          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            Fields marked with * are required. All events are subject to review.
          </Alert>

          <Stack spacing={4}>
            {/* Image Upload Section */}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Event Image
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                JPEG, PNG or GIF • Max 5MB
              </Typography>

              <StyledButton
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
                disabled={uploadState.isUploading}
                sx={{
                  backgroundColor: 'primary.main',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '&:disabled': { backgroundColor: 'grey.300' },
                }}
              >
                {form.image_url ? 'Replace Image' : 'Upload Image'}
                <input 
                  hidden 
                  type="file" 
                  accept={ALLOWED_FILE_TYPES.join(',')} 
                  onChange={handleImageUpload} 
                />
              </StyledButton>

              {uploadState.isUploading && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Uploading... {uploadState.progress}%
                  </Typography>
                  <Box sx={{ 
                    width: '100%', 
                    height: 8, 
                    backgroundColor: 'grey.200', 
                    borderRadius: 4 
                  }}>
                    <Box
                      sx={{
                        width: `${uploadState.progress}%`,
                        height: '100%',
                        backgroundColor: 'primary.main',
                        borderRadius: 4,
                        transition: 'width .3s',
                      }}
                    />
                  </Box>
                </Box>
              )}

              {form.image_url && (
                <Box sx={{ position: 'relative', mt: 2 }}>
                  <img
                    src={form.image_url}
                    alt="Event preview"
                    style={{ 
                      width: '100%', 
                      maxHeight: 400, 
                      objectFit: 'cover', 
                      borderRadius: 12 
                    }}
                  />
                  <IconButton
                    onClick={removeImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,.5)',
                      color: '#fff',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,.7)' },
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Basic Information Section */}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    name="title"
                    label="Event Title *"
                    value={form.title}
                    onChange={handleChange}
                    onBlur={() => handleBlur('title')}
                    error={touched.title && !!errors.title}
                    helperText={touched.title && errors.title}
                    fullWidth
                    InputProps={{
                      endAdornment: touched.title && !errors.title ? (
                        <InputAdornment position="end">
                          <CheckCircleIcon color="success" />
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    name="description"
                    label="Description *"
                    value={form.description}
                    onChange={handleChange}
                    onBlur={() => handleBlur('description')}
                    error={touched.description && !!errors.description}
                    helperText={
                      touched.description && 
                      (errors.description || `${form.description.length}/100 characters`)
                    }
                    fullWidth
                    multiline
                    rows={4}
                    inputProps={{ maxLength: 100 }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Date & Time Section */}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Date & Time
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Start Date & Time *"
                    value={form.startDate ? new Date(form.startDate) : null}
                    onChange={(date) => 
                      setForm(prev => ({ 
                        ...prev, 
                        startDate: date ? date.toISOString() : '' 
                      }))
                    }
                    onClose={() => handleBlur('startDate')}
                    renderInput={(props) => (
                      <StyledTextField
                        {...props}
                        fullWidth
                        error={touched.startDate && !!errors.startDate}
                        helperText={touched.startDate && errors.startDate}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="End Date & Time *"
                    value={form.endDate ? new Date(form.endDate) : null}
                    onChange={(date) => 
                      setForm(prev => ({ 
                        ...prev, 
                        endDate: date ? date.toISOString() : '' 
                      }))
                    }
                    onClose={() => handleBlur('endDate')}
                    minDateTime={form.startDate ? new Date(form.startDate) : undefined}
                    renderInput={(props) => (
                      <StyledTextField
                        {...props}
                        fullWidth
                        error={touched.endDate && !!errors.endDate}
                        helperText={touched.endDate && errors.endDate}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Location Section */}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Location
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    name="venue_name"
                    label="Venue Name *"
                    value={form.venue_name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('venue_name')}
                    error={touched.venue_name && !!errors.venue_name}
                    helperText={touched.venue_name && errors.venue_name}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceChanged}
                    fields={['geometry', 'formatted_address']}
                  >
                    <StyledTextField
                      label="Location *"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      onBlur={() => handleBlur('location')}
                      error={touched.location && !!errors.location}
                      helperText={
                        touched.location
                          ? errors.location || 'Start typing to search for a location'
                          : ''
                      }
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <img
                              src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png"
                              alt="Powered by Google"
                              height={16}
                              style={{ marginRight: 4 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Autocomplete>
                </Grid>
              </Grid>
            </Box>

            {/* Event Features Section */}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Event Features
              </Typography>
              <Grid container spacing={2}>
                {featureOptions.map(({ key, label, description, icon, checkedIcon }) => (
                  <Grid key={key} item xs={12} sm={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: form[key as keyof EventForm] 
                          ? 'primary.main' 
                          : 'grey.200',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            name={key}
                            checked={form[key as keyof EventForm] as boolean}
                            onChange={handleChange}
                            icon={icon}
                            checkedIcon={checkedIcon}
                          />
                        }
                        label={
                          <Box>
                            <Typography fontWeight={600}>{label}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {description}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Categories Section */}
            {availableCategories.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Categories
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Select up to 3
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableCategories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      clickable
                      variant={form.categories.includes(category) ? 'filled' : 'outlined'}
                      color={form.categories.includes(category) ? 'primary' : 'default'}
                      onClick={() => toggleCategory(category)}
                      sx={{ 
                        borderRadius: 1, 
                        px: 1.5, 
                        py: 1.5, 
                        fontSize: '0.875rem' 
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <StyledButton
                variant="contained"
                onClick={() => navigate(-1)}
                startIcon={<CancelIcon />}
                sx={{
                  backgroundColor: '#b71c1c',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#a31818' },
                }}
              >
                Cancel
              </StyledButton>

              <StyledButton
                variant="contained"
                onClick={handleSubmit}
                startIcon={<CheckCircleIcon />}
                disabled={uploadState.isUploading}
                sx={{
                  backgroundColor: 'primary.main',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '&:disabled': { backgroundColor: 'grey.300' },
                }}
              >
                {uploadState.isUploading ? 'Creating...' : 'Create Event'}
              </StyledButton>
            </Box>
          </Stack>
        </Paper>

        {/* Modal Dialog */}
        <Dialog
          open={modal.open}
          onClose={closeModal}
          PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: modal.success ? 'success.main' : 'error.main',
            }}
          >
            {modal.success ? (
              <CheckCircleIcon color="success" fontSize="large" />
            ) : (
              <ErrorIcon color="error" fontSize="large" />
            )}
            {modal.title}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>{modal.message}</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <StyledButton
              fullWidth
              variant="contained"
              onClick={closeModal}
              sx={{
                backgroundColor: modal.success ? 'success.main' : 'error.main',
                color: '#fff',
                '&:hover': { 
                  backgroundColor: modal.success ? 'success.dark' : 'error.dark' 
                },
              }}
            >
              {modal.success ? 'View Events' : 'Got it'}
            </StyledButton>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent;