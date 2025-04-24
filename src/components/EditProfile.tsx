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
      await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profile_picture: imageUrl }),
      });

      await fetch(`/api/preferences/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryNames: selectedCategories }),
      });

      const updatedRes = await fetch("/auth/me", { credentials: "include" });
      const updatedUser = await updatedRes.json();

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
          maxHeight: "80vh",
          overflowY: "auto",
          mx: "auto",
          my: "10vh",
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
          sx={{ mb: 2, backgroundColor: "black", color: "white" }}
        >
          {uploading ? "Uploading..." : "Upload Profile Picture"}
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </Button>

        <Typography variant="subtitle1" mt={2} mb={1}>
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
                backgroundColor: selectedCategories.includes(category) ? "black" : undefined,
                color: selectedCategories.includes(category) ? "white" : undefined,
                "&:hover": {
                  boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                },
              }}
            >
              {category.toUpperCase()}
            </Button>
          ))}
        </Stack>

        <Stack direction="row" justifyContent="space-between" mt={3}>
          <Button
            type="submit"
            sx={{
              backgroundColor: "black",
              color: "white",
              px: 3,
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            Confirm
          </Button>

          <Button
            type="button"
            onClick={onClose}
            sx={{
              backgroundColor: "black",
              color: "white",
              px: 3,
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default EditProfile;