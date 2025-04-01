import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

type Props = {
  user: {
    id: string;
    name: string;
    profile_picture?: string;
  } | null;
};

const EditProfile: React.FC<Props> = ({ user }) => {
  const [name, setName] = useState(user?.name || "");
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || "");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      console.error("User ID is missing.");
      return;
    }

    fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        profile_picture: profilePicture,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
      })
      .then((data) => {
        console.log("Profile updated:", data);
        alert("Changes saved!");
        navigate('/userprofile');
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
      });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Edit Profile
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            fullWidth
            required
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Profile Picture URL"
            fullWidth
            margin="normal"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#3f0071",
              "&:hover": {
                boxShadow: "0 0 10px #3f0071",
              },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProfile;
function alert(arg0: string) {
  throw new Error("Function not implemented.");
}

