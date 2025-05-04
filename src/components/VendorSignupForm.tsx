import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
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
  Container,
  Grid,
  InputAdornment,
  Stack,
  styled
} from "@mui/material";

import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
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

    // make sure that email is valid
     else if (!formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) newErrors.email = 'Email address should be valid';
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

  // check for validity with every change made to the form
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
                  </Grid>
                </Box>

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
