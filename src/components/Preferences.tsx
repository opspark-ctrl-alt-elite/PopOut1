import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
} from "@mui/material";

const categoriesList = [
  "Food & Drink",
  "Art",
  "Music",
  "Sports & Fitness",
  "Hobbies",
];

const Preferences: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setUserId(data.id);
        } else {
          console.error("User not found");
        }
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    if (!userId) {
      console.error("User ID missing");
      return;
    }

    fetch(`/users/${userId}/preferences`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ categories: selectedCategories }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update preferences");
        return res.json();
      })
      .then((data) => {
        console.log("Preferences updated:", data);
        alert("Preferences saved!");
        navigate('/userprofile');
      })
      .catch((err) => {
        console.error("Error updating preferences:", err);
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Paper elevation={4} sx={{ p: 5, borderRadius: 3, width: "100%", maxWidth: 500 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Select Your Preference
        </Typography>
        <Typography variant="body1" mb={3}>
          Choose one or more categories that best fit your interests.
        </Typography>

        <Stack spacing={2}>
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

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            fullWidth
            sx={{ mt: 3, backgroundColor: "#3f0071" }}
          >
            SAVE PREFERENCES
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Preferences;