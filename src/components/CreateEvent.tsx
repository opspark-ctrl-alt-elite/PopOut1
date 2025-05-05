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
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
  AlertTitle,
  styled
} from '@mui/material';
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

const CreateEvent = () => {
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries
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
    categories: [] as string[]
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    success: false
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
    if (!form.description) newErrors.description = 'Description is required';
    if (form.description && form.description.length > 100) {
      newErrors.description = 'Description must be 100 characters or less';
    }
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <= new Date(form.startDate)
    ) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!form.venue_name) newErrors.venue_name = 'Venue is required';
    if (!form.location) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setForm(prev => {
      const selected = prev.categories.includes(category);
      return {
        ...prev,
        categories: selected
          ? prev.categories.filter(c => c !== category)
          : [...prev.categories, category]
      };
    });
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (place && location) {
      setForm(prev => ({
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

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setModal({
        open: true,
        title: 'Invalid File',
        message: 'Please upload a JPEG, PNG, or GIF image.',
        success: false
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setModal({
        open: true,
        title: 'File Too Large',
        message: 'Maximum file size is 5MB.',
        success: false
      });
      return;
    }

    const formData = new FormData();
    formData.append('imageUpload', file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await axios.post('/api/images/event/new', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: progressEvent => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      });

      const uploadResult = response.data[0];
      setForm(prev => ({
        ...prev,
        image_url: uploadResult.secure_url || uploadResult.url
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setModal({
        open: true,
        title: 'Upload Failed',
        message: 'There was an error uploading your image. Please try again.',
        success: false
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
      await axios.post('/api/events', payload, { withCredentials: true });
      setModal({
        open: true,
        title: 'Success!',
        message: 'Your popup has been created successfully.',
        success: true
      });
    } catch (err) {
      console.error(err);
      setModal({
        open: true,
        title: 'Error',
        message: 'There was an error creating your popup. Please try again.',
        success: false
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleModalClose = () => {
    setModal(prev => ({ ...prev, open: false }));
    if (modal.success) navigate('/active-events');
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
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

  if (!isLoaded) {
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
          <Typography variant='h6'>Loading Popup Creator...</Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth='md' sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Typography variant='h4' gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Create New Popup
          </Typography>

          <Alert severity='info' icon={<InfoIcon />} sx={{ mb: 3 }}>
            Fields marked with * are required. All popups are subject to review.
          </Alert>

          <Stack spacing={4}>
            {/* Image Upload Section */}
            <Box>
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Popup Image
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Upload a high-quality image that represents your popup (JPEG,
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

                {uploading && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='body2' gutterBottom>
                      Uploading: {uploadProgress}%
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: 'grey.200',
                        borderRadius: 4
                      }}
                    >
                      <Box
                        sx={{
                          width: `${uploadProgress}%`,
                          height: '100%',
                          backgroundColor: 'primary.main',
                          borderRadius: 4,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {form.image_url && (
                  <Box sx={{ position: 'relative', mt: 2 }}>
                    <img
                      src={form.image_url}
                      alt='Popup preview'
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                    <IconButton
                      onClick={removeImage}
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
                    label='Popup Title *'
                    value={form.title}
                    onChange={handleChange}
                    onBlur={() => handleBlur('title')}
                    error={touched.title && !!errors.title}
                    helperText={touched.title && errors.title}
                    fullWidth
                    variant='outlined'
                    InputProps={{
                      endAdornment: touched.title && !errors.title && (
                        <InputAdornment position='end'>
                          <CheckCircleIcon color='success' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    name='description'
                    label='Description *'
                    value={form.description}
                    onChange={handleChange}
                    onBlur={() => handleBlur('description')}
                    error={touched.description && !!errors.description}
                    helperText={
                      touched.description &&
                      (errors.description ||
                        `${form.description.length}/100 characters`)
                    }
                    fullWidth
                    multiline
                    rows={4}
                    variant='outlined'
                    inputProps={{
                      maxLength: 100
                    }}
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
                    onChange={val =>
                      setForm(prev => ({
                        ...prev,
                        startDate: val ? val.toISOString() : ''
                      }))
                    }
                    onClose={() => handleBlur('startDate')}
                    renderInput={params => (
                      <StyledTextField
                        {...params}
                        fullWidth
                        error={touched.startDate && !!errors.startDate}
                        helperText={touched.startDate && errors.startDate}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label='End Date & Time *'
                    value={form.endDate ? new Date(form.endDate) : null}
                    onChange={val =>
                      setForm(prev => ({
                        ...prev,
                        endDate: val ? val.toISOString() : ''
                      }))
                    }
                    onClose={() => handleBlur('endDate')}
                    minDateTime={
                      form.startDate ? new Date(form.startDate) : undefined
                    }
                    renderInput={params => (
                      <StyledTextField
                        {...params}
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
                    onBlur={() => handleBlur('venue_name')}
                    error={touched.venue_name && !!errors.venue_name}
                    helperText={touched.venue_name && errors.venue_name}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    onLoad={a => (autocompleteRef.current = a)}
                    onPlaceChanged={handlePlaceChanged}
                    fields={['geometry', 'formatted_address']}
                  >
                    <StyledTextField
                      label='Location *'
                      name='location'
                      value={form.location}
                      onChange={handleChange}
                      onBlur={() => handleBlur('location')}
                      error={touched.location && !!errors.location}
                      helperText={
                        touched.location
                          ? errors.location ||
                            'Start typing to search for a location'
                          : ''
                      }
                      fullWidth
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

            {/* Popup Features */}
            <Box>
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Popup Features
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
                            Free Popup
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
                            Sober Popup
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
                  Select all that apply (max 3)
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
  variant="contained"          
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
      color: '#b71c1c',
    },
  }}
>
  Cancel
</StyledButton>

              <StyledButton
                variant='contained'
                onClick={handleSubmit}
                startIcon={<CheckCircleIcon />}
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
                {uploading ? 'Creating...' : 'Create Popup'}
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
            <StyledButton
              onClick={handleModalClose}
              variant='contained'
              fullWidth
              sx={{
                backgroundColor: modal.success ? 'success.main' : 'error.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: modal.success ? 'success.dark' : 'error.dark'
                }
              }}
            >
              {modal.success ? 'View Popups' : 'Got It'}
            </StyledButton>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent;
