import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
} from "@mui/material";

type Category = string;

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  location?: string | null;
  is_vendor?: boolean;
  Categories?: { id: number; name: string }[];
};

type PreferencesProps = {
  setUser: (user: User | ((prevUser: User | null) => User)) => void;
};

const categoriesList: Category[] = [
  "Food & Drink",
  "Art",
  "Music",
  "Sports & Fitness",
  "Hobbies",
];

const Preferences: React.FC<PreferencesProps> = ({ setUser }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user on mount
  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setUserId(data.id);
          setUser(data); // initial set
          if (data.Categories) {
            const categoryNames = data.Categories.map((cat: any) => cat.name);
            setSelectedCategories(categoryNames);
          }
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

    console.log("📤 Selected categories:", selectedCategories);

    fetch(`/api/preferences/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ categoryNames: selectedCategories }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update preferences");
        return res.json();
      })
      .then((data) => {
        console.log(" PATCH RESPONSE:", data);

        // Merge old user with updated fields
        setUser((prevUser) => {
          if (!prevUser) return data.updated;
          return {
            ...prevUser,
            ...data.updated, // merges in location, is_vendor, Categories
          };
        });

        navigate("/userprofile");
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
      <Paper
        elevation={4}
        sx={{ p: 5, borderRadius: 3, width: "100%", maxWidth: 500 }}
      >
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
              variant={
                selectedCategories.includes(category)
                  ? "contained"
                  : "outlined"
              }
              onClick={() => toggleCategory(category)}
              fullWidth
              sx={{
                backgroundColor: selectedCategories.includes(category)
                  ? "#3f0071"
                  : undefined,
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
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 3, backgroundColor: "#3f0071" }}
        >
          SAVE PREFERENCES
        </Button>
      </Paper>
    </Box>
  );
};

export default Preferences;