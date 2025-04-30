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
  DialogTitle
} from "@mui/material";

import {
  ArrowUpward,
  Block
} from "@mui/icons-material";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
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
  message: string | Element | unknown;
  success: boolean;
}

const VendorSignupForm: React.FC<Props> = ({ user, getUser, captcha, setCaptcha }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    email: "",
    facebook: "",
    instagram: "",
    store: "",
    // profilePicture: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modal, setModal] = useState<ModalType>({
    open: false,
    title: '',
    message: '',
    success: false,
  });

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
      // then redirect to game
      navigate("/game");
    }
  }, [ captcha ]);

  // when form validation is run and the errors state is altered, change the modal state only if there are any errors present
  useEffect(() => {
    // if there are errors in the form, then display said errors in a modal
    // TODO: tried to use ` to turn into string to fix hydration error, didn't work
    if (Object.keys(errors).length > 0) {
      setModal({ open: true, title: 'Error', message: (<Box><Typography>Please fix the errors in the form:</Typography>{Object.values(errors).map((errorString: string) => {
        return <Typography>{errorString}</Typography>
      })}</Box>), success: false });
    }
  }, [ errors ])

  // function to determine whether or not the form is ready to be submitted
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

/*
const input = document.createElement('input');
    input.type = 'email';
    input.value = email;
    return input.checkValidity();
*/
    // make sure that email is valid
    // TODO: make code original?
    if (!formData.email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) newErrors.email = 'Email address should be valid';

    // if facebook profile link was given, check if valid
    if (formData.facebook) {
      if (formData.facebook.slice(0, 25) !== 'https://www.facebook.com/' || formData.facebook.length === 25) newErrors.facebook = 'Facebook link must follow this format "https://www.facebook.com/YourAccountNameHere"';
    }
    // if instagram profile link was given, check if valid
    if (formData.instagram) {
      if (formData.instagram.slice(0, 26) !== 'https://www.instagram.com/' || formData.instagram.length === 26) newErrors.instagram = 'Instagram link must follow this format "https://www.instagram.com/YourAccountNameHere"';
    }
    // if store website link was given, check if the website at least has https
    if (formData.store) {
      if (formData.store.slice(0, 8) !== 'https://' || formData.store.length === 8) newErrors.store = 'Online store link must have https support (no http)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    // validate the form inputs first
    if (!validate()) {
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
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: 'url("/image.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1,
        },
      }}
    >
      {user ? (

        <Paper
          elevation={6}
          sx={{
            zIndex: 2,
            p: 4,
            borderRadius: 3,
            maxWidth: 500,
            width: "90%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Become A Vendor
          </Typography>
          <Typography variant="body2" mb={2}>
            Fill out the form to join our platform and grow your business.
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              name="businessName"
              label="Business Name (required)"
              fullWidth
              required
              margin="normal"
              value={formData.businessName}
              onChange={handleChange}
              error={errors.businessName !== undefined || formData.businessName.length > 50}
              helperText={`character limit: ${formData.businessName.length}/50${formData.businessName.length > 50 ? " LIMIT EXCEEDED" : ""} ${errors.businessName ? "| " + errors.businessName : ""}`}
            />
            <TextField
              name="description"
              label="Business Description (required)"
              fullWidth
              required
              multiline
              rows={3}
              margin="normal"
              value={formData.description}
              onChange={handleChange}
              error={errors.description !== undefined || formData.description.length > 300}
              helperText={`character limit: ${formData.description.length}/300${formData.description.length > 300 ? " LIMIT EXCEEDED" : ""}`}
            />
            <TextField
              name="email"
              label="Business Email (required)"
              fullWidth
              required
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              error={errors.email !== undefined || formData.email.length > 255}
              helperText={`${formData.email.length > 255 ? "Default character limit of 255 has been exceeded" : ""} ${(errors.email && formData.email.length > 255) ? "| " : ""}${errors.email ? errors.email : ""}`}
            />
            <TextField
              name="facebook"
              label="Facebook Account URL (optional)"
              fullWidth
              margin="normal"
              value={formData.facebook}
              onChange={handleChange}
              error={errors.facebook !== undefined || formData.facebook.length > 255}
              helperText={`${formData.facebook.length > 255 ? "Default character limit of 255 has been exceeded" : ""} ${(errors.facebook && formData.facebook.length > 255) ? "| " : ""}${errors.facebook ? errors.facebook : ""}`}
            />
            <TextField
              name="instagram"
              label="Instagram Account URL (optional)"
              fullWidth
              margin="normal"
              value={formData.instagram}
              onChange={handleChange}
              error={errors.instagram !== undefined || formData.instagram.length > 255}
              helperText={`${formData.instagram.length > 255 ? "Default character limit of 255 has been exceeded" : ""} ${(errors.instagram && formData.instagram.length > 255) ? "| " : ""}${errors.instagram ? errors.instagram : ""}`}
            />
            <TextField
              name="store"
              label="Online Store URL (optional)"
              fullWidth
              margin="normal"
              value={formData.store}
              onChange={handleChange}
              error={errors.store !== undefined || formData.store.length > 255}
              helperText={`${formData.store.length > 255 ? "Default character limit of 255 has been exceeded" : ""} ${(errors.store && formData.store.length > 255) ? "| " : ""}${errors.store ? errors.store : ""}`}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, backgroundColor: "#3f0071" }}
              startIcon={<ArrowUpward />}
            >
              Submit
            </Button>
            <Link to="/">
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, backgroundColor: "#BA2020" }}
                startIcon={<Block />}
              >
                Cancel
              </Button>
            </Link>
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
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={6}
          sx={{
            zIndex: 2,
            p: 4,
            borderRadius: 3,
            maxWidth: 500,
            width: "90%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Become A Vendor
          </Typography>
          <Typography variant="body2" mb={2}>
            It would appear that you are not signed in. Please click "Sign In" in the upper right corner to sign into your account and get sent back to the home page before trying to become a vendor.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default VendorSignupForm;
