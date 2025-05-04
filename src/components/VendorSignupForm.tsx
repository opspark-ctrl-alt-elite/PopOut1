import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageUpload from "./ImageUpload";

import {
  Box,
  Modal,
  TextField,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Autocomplete,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  AlertTitle,
  styled
} from "@mui/material";

import {
  ArrowUpward,
  Block,
  Upload as UploadIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ChildCare as ChildCareIcon,
  FreeBreakfast as FreeBreakfastIcon,
  Paid as PaidIcon
} from "@mui/icons-material";

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      borderColor: theme.palette.grey[300],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
}));

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  is_vendor: boolean;
};

type Captcha = {
  beatCaptcha: boolean;
  wantsToBeVendor: boolean;
}

type Props = {
  user: User | null;
  getUser: Function;
  captcha: Captcha;
  setCaptcha: Function;
};

type ModalType = {
  open: boolean;
  title: string;
  message: string;
  success: boolean;
}

const VendorSignupForm: React.FC<Props> = ({ user, getUser, captcha, setCaptcha }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    email: "",
    facebook: "",
    instagram: "",
    website: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modal, setModal] = useState<ModalType>({
    open: false,
    title: '',
    message: '',
    success: false,
  });
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const navigate = useNavigate();

  // check the captcha state status flags
  useEffect(() => {
    // if the captcha hasn't been beaten
    if (!captcha.beatCaptcha) {
      // then set the wantsToBeVendor state status flag to true
      setCaptcha({
        beatCaptcha: false,
        wantsToBeVendor: true
      })
    } // else, if the user just got back from beating the captcha to become a vendor
    else if (captcha.beatCaptcha && captcha.wantsToBeVendor) {
      // set "wantsToBeVendor" flag to false to allow for normal playing of the game
      setCaptcha({
        beatCaptcha: true,
        wantsToBeVendor: false
      })
    }
  }, []);
  useEffect(() => {
    // if the user hasn't beaten the captcha yet and wants to be a vendor
    if (!captcha.beatCaptcha && captcha.wantsToBeVendor) {
      // then redirect to game if the user is logged in and not already a vendor
      if (user && !user.is_vendor) {
        navigate("/game");
      }
    }
  }, [ user, captcha ]);

  // // when form validation is run and the errors state is altered, change the modal state only if there are any errors present
  // useEffect(() => {
  //   // if there are errors in the form, then display said errors in a modal
  //   // TODO: tried to use ` to turn into string to fix hydration error, didn't work
  //   if (Object.keys(errors).length > 0) {
  //     setModal({ open: true, title: 'Error', message: (<Box><Typography>Please fix the errors in the form:</Typography>{Object.values(errors).map((errorString: string) => {
  //       return <Typography>{errorString}</Typography>
  //     })}</Box>), success: false });
  //   }
  // }, [ errors ])

  // helper function that checks the validity of emails and urls
  const emailAndURLChecker = (type: string, value: string) => {
    // create an element with the given type and value
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    // check if the value is valid for the given type
    return input.checkValidity();
  }

  // function to determine whether or not the form is ready to be submitted
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // check if required fields are present and aren't over the character limit
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    else if (formData.businessName.length > 50) newErrors.businessName = 'Business name must be 50 characters or less';
    if (!formData.description) newErrors.description = 'Description is required';
    else if (formData.description.length > 300) newErrors.description = 'Description must be 300 characters or less';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (formData.email.length > 255) newErrors.email = 'Email length must be at or below the default limit (255 characters)';

/*
const input = document.createElement('input');
    input.type = 'email';
    input.value = email;
    return input.checkValidity();
*/
    // make sure that email is valid
    // TODO: make code original? (can you even claim a line of regex?)
     else if (!formData.email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) newErrors.email = 'Email address should be valid';
     else if (!emailAndURLChecker('email', formData.email)) newErrors.email = 'Email address should be valid';

    // if facebook profile link was given, check if valid and has proper length
    if (formData.facebook) {
      if (formData.facebook.length > 255) newErrors.facebook = 'Facebook link length must be at or below the default limit (255 characters)';
      else if (formData.facebook.slice(0, 25) !== 'https://www.facebook.com/' || formData.facebook.length === 25) newErrors.facebook = 'Facebook link must follow this format "https://www.facebook.com/YourAccountNameHere"';
      else if (!emailAndURLChecker('url', formData.facebook)) newErrors.facebook = 'Facebook link should be valid';
    }
    // if instagram profile link was given, check if valid and has proper length
    if (formData.instagram) {
      if (formData.instagram.length > 255) newErrors.instagram = 'Instagram link length must be at or below the default limit (255 characters)';
      else if (formData.instagram.slice(0, 26) !== 'https://www.instagram.com/' || formData.instagram.length === 26) newErrors.instagram = 'Instagram link must follow this format "https://www.instagram.com/YourAccountNameHere"';
      else if (!emailAndURLChecker('url', formData.instagram)) newErrors.instagram = 'Instagram link should be valid';
    }
    // if store website link was given, check if the website at least has https and has proper length
    if (formData.website) {
      if (formData.website.length > 255) newErrors.website = 'Store link length must be at or below the default limit (255 characters)';
      else if (formData.website.slice(0, 8) !== 'https://' || formData.website.length === 8) newErrors.website = 'Online store link must have https support (no http)';
      else if (!emailAndURLChecker('url', formData.website)) newErrors.website = 'Online store link should be valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // check for validity with every change made to the form TODO:
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  // determine whether or not to redirect after a vendor form submission attempt
  const handleModalClose = () => {
    setModal((prev) => ({ ...prev, open: false }));
    if (modal.success) navigate('/vendorprofile');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // upon submitting, turn "touched" status to true for all fields
    setTouched({
      businessName: true,
      description: true,
      email: true,
      facebook: true,
      instagram: true,
      website: true,
    })

    // validate the form inputs first
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
      // send request to add new vendor to the database
      const res = await fetch(`/api/vendor/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Send cookies/session info
        body: JSON.stringify(formData),
      });

      // wait for the response json to resolve
      const result = await res.json();

      if (!res.ok) {
        // determine the error message to display
        let errMessage = result.error;
        if (result.message && result.message.original) {
          if (result.message.original.code === 'ER_DATA_TOO_LONG') {
            // handle errors for overly-long data
            errMessage = `Too long of an input was given for the ${result.message.original.sqlMessage.split("'")[1]} field`;
          } else if (result.message.original.code === 'ER_DUP_ENTRY') {
            // handle errors for duplicate unique vendor properties
            const errMsgRef = result.message.original.sqlMessage.split("vendors.");
            let fieldRef: keyof typeof formData = errMsgRef[errMsgRef.length - 1];
            fieldRef = fieldRef.slice(0, fieldRef.length - 1) as keyof typeof formData;
            errMessage = `Another vendor already was given ${formData[fieldRef]} for the ${fieldRef} field`;
            setErrors((prev) => ({
              ...prev,
              [fieldRef]: "More than one vendor cannot have the same value for this field",
            }));
          } else {
            // handle any other less common database-related errors
            errMessage = `Uncommon database error: ${result.message.original.sqlMessage}`
          }
        }
        throw new Error(`Failed to submit vendor signup, please ensure there are no unresolved errors left in the form: ${errMessage}`);
      }

      // update the user in state to reflect vendor status
      await getUser();

      // open success modal;
      setModal({ open: true, title: 'Congratulations', message: 'You are now a vendor!', success: true });
    } catch (err) {
      console.error("Error submitting vendor form", err);
      // open failure modal
      setModal({ open: true, title: 'Error', message: String(err), success: false });
    }
  };

  return (
    // <Box
    //   sx={{
    //     position: "relative",
    //     minHeight: "100vh",
    //     display: "flex",
    //     justifyContent: "center",
    //     alignItems: "center",
    //     backgroundImage: 'url("/image.png")',
    //     backgroundSize: "cover",
    //     backgroundPosition: "center",
    //     backgroundRepeat: "no-repeat",
    //     "&::before": {
    //       content: '""',
    //       position: "absolute",
    //       inset: 0,
    //       backgroundColor: "rgba(0,0,0,0.5)",
    //       zIndex: 1,
    //     },
    //   }}
    // >
    //   {user ? (

    //     <Paper
    //       elevation={6}
    //       sx={{
    //         zIndex: 2,
    //         p: 4,
    //         borderRadius: 3,
    //         maxWidth: 500,
    //         width: "90%",
    //         backgroundColor: "rgba(255, 255, 255, 0.95)",
    //       }}
    //     >
    //       <Typography variant="h5" fontWeight="bold" gutterBottom>
    //         Become A Vendor
    //       </Typography>
    //       <Typography variant="body2" mb={2}>
    //         Fill out the form to join our platform and grow your business.
    //       </Typography>
    //       <Box component="form" onSubmit={handleSubmit}>
    //         <TextField
    //           name="businessName"
    //           label="Business Name (required)"
    //           fullWidth
    //           required
    //           margin="normal"
    //           value={formData.businessName}
    //           onChange={handleChange}
    //           error={errors.businessName !== undefined || formData.businessName.length > 50}
    //           helperText={`character limit: ${formData.businessName.length}/50${formData.businessName.length > 50 ? " LIMIT EXCEEDED" : ""} ${errors.businessName ? "| " + errors.businessName : ""}`}
    //         />
    //         <TextField
    //           name="description"
    //           label="Business Description (required)"
    //           fullWidth
    //           required
    //           multiline
    //           rows={3}
    //           margin="normal"
    //           value={formData.description}
    //           onChange={handleChange}
    //           error={errors.description !== undefined || formData.description.length > 300}
    //           helperText={`character limit: ${formData.description.length}/300${formData.description.length > 300 ? " LIMIT EXCEEDED" : ""}`}
    //         />
    //         <TextField
    //           name="email"
    //           label="Business Email (required)"
    //           fullWidth
    //           required
    //           margin="normal"
    //           value={formData.email}
    //           onChange={handleChange}
    //           error={errors.email !== undefined || formData.email.length > 255}
    //           helperText={`${formData.email.length > 255 ? "Default character limit of 255 has been exceeded" : ""} ${(errors.email && formData.email.length > 255) ? "| " : ""}${errors.email ? errors.email : ""}`}
    //         />
    //         <TextField
    //           name="facebook"
    //           label="Facebook Account URL (optional)"
    //           fullWidth
    //           margin="normal"
    //           value={formData.facebook}
    //           onChange={handleChange}
    //           error={errors.facebook !== undefined || formData.facebook.length > 255}
    //           helperText={`${formData.facebook.length > 255 ? "Default character limit of 255 has been exceeded" : ""} ${(errors.facebook && formData.facebook.length > 255) ? "| " : ""}${errors.facebook ? errors.facebook : ""}`}
    //         />
    //         <TextField
    //           name="instagram"
    //           label="Instagram Account URL (optional)"
    //           fullWidth
    //           margin="normal"
    //           value={formData.instagram}
    //           onChange={handleChange}
    //           error={errors.instagram !== undefined || formData.instagram.length > 255}
    //           helperText={`${formData.instagram.length > 255 ? "Default character limit of 255 has been exceeded" : ""} ${(errors.instagram && formData.instagram.length > 255) ? "| " : ""}${errors.instagram ? errors.instagram : ""}`}
    //         />
    //         <TextField
    //           name="website"
    //           label="Online Store URL (optional)"
    //           fullWidth
    //           margin="normal"
    //           value={formData.website}
    //           onChange={handleChange}
    //           error={errors.website !== undefined || formData.website.length > 255}
    //           helperText={`${formData.website.length > 255 ? "Default character limit of 255 has been exceeded" : ""} ${(errors.website && formData.website.length > 255) ? "| " : ""}${errors.website ? errors.website : ""}`}
    //         />
    //         <Button
    //           type="submit"
    //           variant="contained"
    //           fullWidth
    //           sx={{ mt: 3, backgroundColor: "#3f0071" }}
    //           startIcon={<ArrowUpward />}
    //         >
    //           Submit
    //         </Button>
    //         <Link to="/">
    //           <Button
    //             variant="contained"
    //             fullWidth
    //             sx={{ mt: 3, backgroundColor: "#BA2020" }}
    //             startIcon={<Block />}
    //           >
    //             Cancel
    //           </Button>
    //         </Link>
    //         <Dialog open={modal.open} onClose={handleModalClose}>
    //           <DialogTitle>{modal.title}</DialogTitle>
    //           <DialogContent>
    //             <DialogContentText>{modal.message}</DialogContentText>
    //           </DialogContent>
    //           <DialogActions>
    //             <Button
    //               size="small"
    //               onClick={handleModalClose}
    //             >
    //               Close
    //             </Button>
    //           </DialogActions>
    //         </Dialog>
    //       </Box>
    //     </Paper>
    //   ) : (
    //     <Paper
    //       elevation={6}
    //       sx={{
    //         zIndex: 2,
    //         p: 4,
    //         borderRadius: 3,
    //         maxWidth: 500,
    //         width: "90%",
    //         backgroundColor: "rgba(255, 255, 255, 0.95)",
    //       }}
    //     >
    //       <Typography variant="h5" fontWeight="bold" gutterBottom>
    //         Become A Vendor
    //       </Typography>
    //       <Typography variant="body2" mb={2}>
    //         It would appear that you are not signed in. Please click "Sign In" in the upper right corner to sign into your account and get sent back to the home page before trying to become a vendor.
    //       </Typography>
    //     </Paper>
    //   )}
    // </Box>























    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        {user ? (
          user.is_vendor ? (
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Become A Vendor
              </Typography>
      
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fill out the form to join our platform and grow your business.
              </Typography>
      
              <Alert severity="warning" icon={<InfoIcon />} sx={{ mb: 3 }}>
                You are already a vendor and cannot attempt to become one again. You can delete your current vendor account if you wish to make a new vendor account, otherwise you can just exit this page.
              </Alert>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Become A Vendor
              </Typography>
      
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fill out the form to join our platform and grow your business.
              </Typography>
      
              <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                Fields marked with * are required. All vendors are subject to review.
              </Alert>
      
              <Stack spacing={4}>
                {/* Image Upload Section */}
                {/* <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Popup Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Upload a high-quality image that represents your popup (JPEG, PNG, GIF, max 5MB)
                  </Typography>
                  
                  <Box>
                    <StyledButton
                      variant="contained"
                      component="label"
                      startIcon={<UploadIcon />}
                      disabled={uploading}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '&:disabled': {
                          backgroundColor: 'grey.300',
                        }
                      }}
                    >
                      {form.image_url ? "Replace Image" : "Upload Image"}
                      <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </StyledButton>
                    
                    {uploading && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Uploading: {uploadProgress}%
                        </Typography>
                        <Box sx={{ width: '100%', height: 8, backgroundColor: 'grey.200', borderRadius: 4 }}>
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
                          alt="Popup preview"
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'cover',
                            borderRadius: '12px',
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
                              backgroundColor: 'rgba(0,0,0,0.7)',
                            }
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box> */}
      
                {/* Basic Info Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledTextField
                        name="businessName"
                        label="Business Name *"
                        value={formData.businessName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('businessName')}
                        error={touched.businessName && !!errors.businessName}
                        helperText={
                          ((touched.businessName && errors.businessName) || `${formData.businessName.length}/50 characters`)
                        }
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          endAdornment: touched.businessName && !errors.businessName && (
                            <InputAdornment position="end">
                              <CheckCircleIcon color="success" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <StyledTextField
                        name="description"
                        label="Business Description *"
                        value={formData.description}
                        onChange={handleChange}
                        onBlur={() => handleBlur('description')}
                        error={touched.description && !!errors.description}
                        helperText={
                          ((touched.description && errors.description) || `${formData.description.length}/300 characters`)
                        }
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        inputProps={{
                          maxLength: 300
                        }}
                      />
                    </Grid>
      
                    <Grid item xs={12}>
                      <StyledTextField
                        name="email"
                        label="Business Email *"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        error={touched.email && !!errors.email}
                        helperText={touched.email && errors.email}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
      
                {/* Date & Time Section */}
                {/* <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Date & Time
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DateTimePicker
                        label="Start Date & Time *"
                        value={form.startDate ? new Date(form.startDate) : null}
                        onChange={(val) => setForm(prev => ({ ...prev, startDate: val ? val.toISOString() : '' }))}
                        onClose={() => handleBlur('startDate')}
                        renderInput={(params) => (
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
                        label="End Date & Time *"
                        value={form.endDate ? new Date(form.endDate) : null}
                        onChange={(val) => setForm(prev => ({ ...prev, endDate: val ? val.toISOString() : '' }))}
                        onClose={() => handleBlur('endDate')}
                        minDateTime={form.startDate ? new Date(form.startDate) : undefined}
                        renderInput={(params) => (
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
                </Box> */}
      
                {/* Location Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Connections
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledTextField
                        name="facebook"
                        label="Facebook Account URL"
                        value={formData.facebook}
                        onChange={handleChange}
                        onBlur={() => handleBlur('facebook')}
                        error={touched.facebook && !!errors.facebook}
                        helperText={touched.facebook && errors.facebook}
                        fullWidth
                      />
                    </Grid>
      
                    <Grid item xs={12}>
                      <StyledTextField
                        name="instagram"
                        label="Instagram Account URL"
                        value={formData.instagram}
                        onChange={handleChange}
                        onBlur={() => handleBlur('instagram')}
                        error={touched.instagram && !!errors.instagram}
                        helperText={touched.instagram && errors.instagram}
                        fullWidth
                      />
                    </Grid>
      
                    <Grid item xs={12}>
                      <StyledTextField
                        name="website"
                        label="Online Store URL"
                        value={formData.website}
                        onChange={handleChange}
                        onBlur={() => handleBlur('website')}
                        error={touched.website && !!errors.website}
                        helperText={touched.website && errors.website}
                        fullWidth
                      />
                    </Grid>
                    
                    {/* <Grid item xs={12}>
                      <Autocomplete 
                        onLoad={(a) => (autocompleteRef.current = a)} 
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
                          helperText={touched.location ? (errors.location || 'Start typing to search for a location') : ''}
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton edge="end">
                                  <img 
                                    src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" 
                                    alt="Powered by Google" 
                                    style={{ height: '16px' }} 
                                  />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Autocomplete>
                    </Grid> */}
                  </Grid>
                </Box>
      
                {/* Popup Features */}
                {/* <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Popup Features
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: form.isFree ? 'primary.main' : 'grey.200' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="isFree"
                              checked={form.isFree}
                              onChange={handleChange}
                              icon={<PaidIcon />}
                              checkedIcon={<FreeBreakfastIcon color="success" />}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>Free Popup</Typography>
                              <Typography variant="body2" color="text.secondary">No admission fee</Typography>
                            </Box>
                          }
                          sx={{ width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: form.isKidFriendly ? 'primary.main' : 'grey.200' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="isKidFriendly"
                              checked={form.isKidFriendly}
                              onChange={handleChange}
                              icon={<ChildCareIcon />}
                              checkedIcon={<ChildCareIcon color="success" />}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>Kid-Friendly</Typography>
                              <Typography variant="body2" color="text.secondary">Suitable for children</Typography>
                            </Box>
                          }
                          sx={{ width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: form.isSober ? 'primary.main' : 'grey.200' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="isSober"
                              checked={form.isSober}
                              onChange={handleChange}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={600}>Sober Popup</Typography>
                              <Typography variant="body2" color="text.secondary">No alcohol served</Typography>
                            </Box>
                          }
                          sx={{ width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Box> */}
      
                {/* Categories Section */}
                {/* {availableCategories.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Categories
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Select all that apply (max 3)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {availableCategories.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          clickable
                          variant={form.categories.includes(category) ? 'filled' : 'outlined'}
                          color={form.categories.includes(category) ? 'primary' : 'default'}
                          onClick={() => handleCategoryToggle(category)}
                          sx={{
                            borderRadius: 1,
                            px: 1,
                            py: 1.5,
                            fontSize: '0.875rem',
                            '& .MuiChip-label': {
                              px: 1.5,
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )} */}
      
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                  <StyledButton
                    variant="outlined"
                    onClick={() => { navigate('/') }}
                    startIcon={<CancelIcon />}
                    sx={{
                      borderColor: 'grey.300',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'grey.400',
                      }
                    }}
                  >
                    Cancel
                  </StyledButton>
                  
                  <StyledButton
                    variant="contained"
                    onClick={handleSubmit}
                    startIcon={<CheckCircleIcon />}
                    // disabled={uploading}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '&:disabled': {
                        backgroundColor: 'grey.300',
                      }
                    }}
                  >
                    {/* {uploading ? 'Creating...' : 'Create Popup'} */}
                    Submit
                  </StyledButton>
                </Box>
              </Stack>
            </Paper>
          )
        ) : (
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Become A Vendor
            </Typography>
    
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Fill out the form to join our platform and grow your business.
            </Typography>
    
            <Alert severity="warning" icon={<InfoIcon />} sx={{ mb: 3 }}>
              You are currently not logged in. Please sign in at the top right using Google before attempting to become a vendor.
            </Alert>
          </Paper>
        )}

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
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          color: modal.success ? 'success.main' : 'error.main'
        }}>
          {modal.success ? (
            <CheckCircleIcon color="success" fontSize="large" />
          ) : (
            <ErrorIcon color="error" fontSize="large" />
          )}
          {modal.title}
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            {modal.message}
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <StyledButton
            onClick={handleModalClose}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: modal.success ? 'success.main' : 'error.main',
              color: 'white',
              '&:hover': {
                backgroundColor: modal.success ? 'success.dark' : 'error.dark',
              }
            }}
          >
            {modal.success ? 'View Vendor Profile' : 'Got It'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VendorSignupForm;
