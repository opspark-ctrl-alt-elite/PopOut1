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

const VendorSignupForm: React.FC<Props> = ({ user, getUser, captcha, setCaptcha }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    email: "",
    facebook: "",
    instagram: "",
    store: "",
    profilePicture: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    success: false,
  });

  // states used to toggle the modals
  const [openAlertS, setOpenAlertS] = React.useState(false);
  const [openAlertF, setOpenAlertF] = React.useState(false);

  // create a style for the box that the modal holds
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

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

  // function to determine whether or not the form is ready to be submitted
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.facebook.slice(0, 24) !== 'https://www.facebook.com') newErrors.facebook = 'Facebook link must start with "https://www.facebook.com"';
    if (formData.instagram.slice(0, 25) !== 'https://www.instagram.com') newErrors.venue_name = 'Instagram link must start with "https://www.instagram.com"';
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////if (!form.location) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      setModal({ open: true, title: 'Error', message: 'Please fix the errors in the form.', success: false });
      return;
    }

    try {
      const res = await fetch(`/api/vendor/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Send cookies/session info
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit vendor signup.");
      }

      const result = await res.json();
      console.log(result);
      
      // update the user in state to reflect vendor status
      await getUser();

      // open success modal;
      setOpenAlertS(true);
    } catch (err) {
      console.error("Error submitting vendor form", err);
      // open failure modal
      setOpenAlertF(true);
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
            label="Business Name"
            fullWidth
            required
            margin="normal"
            value={formData.businessName}
            onChange={handleChange}
            error={!!errors.businessName}
            helperText={errors.businessName}
          />
          <TextField
            name="description"
            label="Business Description"
            fullWidth
            required
            multiline
            rows={3}
            margin="normal"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
          />
          <TextField
            name="email"
            label="Business Email"
            fullWidth
            required
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            name="facebook"
            label="Facebook (optional)"
            fullWidth
            margin="normal"
            value={formData.facebook}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            name="instagram"
            label="Instagram (optional)"
            fullWidth
            margin="normal"
            value={formData.instagram}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            name="store"
            label="Online Store (optional)"
            fullWidth
            margin="normal"
            value={formData.store}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />

          {/* Two different methods for adding a vendor profile */}
          {/* <Box sx={{ outline: 5 }}>
            <Typography>
              Add image url or upload image
            </Typography> */}
            <TextField
              name="profilePicture"
              label="Profile Picture URL (optional)"
              fullWidth
              margin="normal"
              value={formData.profilePicture}
              onChange={handleChange}
            />
            <Typography >
              *Custom image may be uploaded after vendor creation.
            </Typography>
            {/* <ImageUpload inputData={formData} setInputData={setFormData} imageKeyName="profilePicture" multiple={false} /> */}
            {/* <ImageUpload setInputData={setFormData} imageKeyName="profilePicture" multiple={false} />
          </Box> */}

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
            <Modal open={openAlertS}>
              <Box sx={style}>
                <Typography variant="h6" component="h2">
                  Vendor request submitted!
                </Typography>
                <Button
                  onClick={() => {
                    navigate('/vendorprofile');
                  }}
                  variant="outlined"
                >
                  OK
                </Button>
              </Box>
            </Modal>
            <Modal open={openAlertF}>
              <Box sx={style}>
                <Typography variant="h6" component="h2">
                  Error submitting vendor form (you may already be a vendor)
                </Typography>
                <Button
                  onClick={() => {
                    setOpenAlertF(false);
                  }}
                  variant="outlined"
                >
                  OK
                </Button>
              </Box>
            </Modal>
        </Box>
      </Paper>
    </Box>
  );
};

export default VendorSignupForm;
