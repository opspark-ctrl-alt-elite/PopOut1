import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Stack,
} from "@mui/material";
import axios from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    profile_picture?: string;
  } | null;
  setUser: (user: any) => void;
};

const EditProfile: React.FC<Props> = ({ open, onClose, user, setUser }) => {
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Set initial values when modal opens
  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setImagePreview(user.profile_picture || "");
      setImageUrl(user.profile_picture || "");
    }
  }, [open, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("imageUpload", file);
    setUploading(true);

    try {
      const response = await axios.post(`/api/images/user/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, profile_picture: imageUrl }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update profile");
        return fetch("/auth/me", { credentials: "include" });
      })
      .then((res) => res.json())
      .then((updatedUser) => {
        setUser(updatedUser);   // ✅ Updates global state
        onClose();              // ✅ Closes modal
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: "white",
          width: 400,
          mx: "auto",
          my: "15vh",
          borderRadius: 2,
          p: 4,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Edit Profile
        </Typography>

        <Stack alignItems="center" mb={2}>
          <Avatar src={imagePreview} sx={{ width: 100, height: 100 }} />
        </Stack>

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
          fullWidth
          disabled={uploading}
          sx={{ mt: 1 }}
        >
          {uploading ? "Uploading..." : "Upload Profile Picture"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!user}
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
    </Modal>
  );
};

export default EditProfile;