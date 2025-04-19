import React, { useEffect, useState } from "react";
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

const categoriesList = [
  "Food & Drink",
  "Art",
  "Music",
  "Sports & Fitness",
  "Hobbies",
];

type Props = {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    profile_picture?: string;
    Categories?: { id: number; name: string }[];
  } | null;
  setUser: (user: any) => void;
};

const EditProfile: React.FC<Props> = ({ open, onClose, user, setUser }) => {
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      const initialURL = user.profile_picture || "";
      setImagePreview(initialURL);
      setImageUrl(initialURL);
      const prefs = user.Categories?.map((c) => c.name) || [];
      setSelectedCategories(prefs);
    }
  }, [open, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("imageUpload", file);
    setUploading(true);

    try {
      const res = await axios.post(`/api/images/user/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data[0]?.secure_url || res.data[0]?.url;
      setImageUrl(url);
      setImagePreview(url);
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      //  PATCH user info
      const updateRes = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profile_picture: imageUrl }),
      });

      if (!updateRes.ok) throw new Error("Failed to update profile");

      //  PUT preferences
      await fetch(`/api/preferences/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryNames: selectedCategories }),
      });

      //  refetch latest user
      const updatedRes = await fetch("/auth/me", { credentials: "include" });
      const updatedUser = await updatedRes.json();

      // set new global user state & close modal
      setUser(updatedUser);
      onClose();
    } catch (err) {
      console.error("Error saving changes:", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component="form"
        onSubmit={handleSave}
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
        >
          {uploading ? "Uploading..." : "Upload Profile Picture"}
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </Button>

        <Typography variant="subtitle1" mt={3} mb={1}>
          Select Your Preferences
        </Typography>

        <Stack spacing={1}>
          {categoriesList.map((category) => (
            <Button
              key={category}
              variant={selectedCategories.includes(category) ? "contained" : "outlined"}
              onClick={() => toggleCategory(category)}
              fullWidth
              sx={{
                backgroundColor: selectedCategories.includes(category) ? "#3f0071" : undefined,
                color: selectedCategories.includes(category) ? "#fff" : undefined,
                "&:hover": {
                  boxShadow: "0 0 10px rgba(63,0,113,0.5)",
                },
              }}
            >
              {category.toUpperCase()}
            </Button>
          ))}
        </Stack>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3, backgroundColor: "#3f0071" }}
        >
          Save Changes
        </Button>
      </Box>
    </Modal>
  );
};

export default EditProfile;