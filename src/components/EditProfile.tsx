import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Avatar,
} from "@mui/material";
import axios from "axios";

type Props = {
  user: {
    id: string;
    name: string;
    profile_picture?: string;
  } | null;
  setUser: (user: any) => void;
};

const EditProfile: React.FC<Props> = ({ user, setUser }) => {
  const [name, setName] = useState(user?.name || "");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profile_picture || "");
  const [imageUrl, setImageUrl] = useState(user?.profile_picture || "");
  const navigate = useNavigate();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("imageUpload", file);

    setUploading(true);

    try {
      const response = await axios.post(
        `/api/images/user/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadResult = response.data[0];
      const url = uploadResult.secure_url || uploadResult.url;

      setImageUrl(url);
      setImagePreview(url);
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        profile_picture: imageUrl,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update profile");
        return fetch("/auth/me", { credentials: "include" });
      })
      .then((res) => res.json())
      .then((updatedUser) => {
        setUser(updatedUser);
        navigate("/userprofile");
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

        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar src={imagePreview} sx={{ width: 100, height: 100 }} />
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            fullWidth
            required
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button
            variant="outlined"
            component="label"
            disabled={uploading}
            sx={{ mt: 2 }}
          >
            {uploading ? "Uploading..." : "Upload Profile Picture"}
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </Button>

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