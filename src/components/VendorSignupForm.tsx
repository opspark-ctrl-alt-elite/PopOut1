import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageUpload from "./ImageUpload";

import {
  Box,
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

type Props = {
  user: User | null;
};

const VendorSignupForm: React.FC<Props> = ({ user }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    email: "",
    facebook: "",
    instagram: "",
    store: "",
    profilePicture: "",
  });

  // the navigate function can be called to redirect a user to a different react-router-dom path
  // (as opposed to using a Link component);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/vendor/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      console.log(result);
      alert("Vendor request submitted!");
      navigate('/');
    } catch (err) {
      console.error("Error submitting vendor form", err);
      alert("Error submitting vendor form (you may already be a vendor)");
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
            label="Business Name *"
            fullWidth
            required
            margin="normal"
            value={formData.businessName}
            onChange={handleChange}
          />
          <TextField
            name="description"
            label="Business Description *"
            fullWidth
            required
            multiline
            rows={3}
            margin="normal"
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            name="email"
            label="Business Email *"
            fullWidth
            required
            margin="normal"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            name="facebook"
            label="Facebook (optional)"
            fullWidth
            margin="normal"
            value={formData.facebook}
            onChange={handleChange}
          />
          <TextField
            name="instagram"
            label="Instagram (optional)"
            fullWidth
            margin="normal"
            value={formData.instagram}
            onChange={handleChange}
          />
          <TextField
            name="store"
            label="Online Store (optional)"
            fullWidth
            margin="normal"
            value={formData.store}
            onChange={handleChange}
          />
          <TextField
            name="profilePicture"
            label="Profile Picture URL (optional)"
            fullWidth
            margin="normal"
            value={formData.profilePicture}
            onChange={handleChange}
          />
          {/* <ImageUpload inputData={formData} setInputData={setFormData} imageKeyName={"profilePicture"}/> */}
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
        </Box>
      </Paper>
    </Box>
  );
};

export default VendorSignupForm;