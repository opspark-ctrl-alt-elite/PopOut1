import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Container,
  Button,
  Divider,
} from "@mui/material";

// category and User types
type Category = {
  id: number;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  categories?: Category[];
};

type Props = {
  user: User | null;
};

const UserProfile: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();

  const handleDeleteUser = () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    fetch(`/user/me`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        navigate("/");
      })
      .catch((err) => {
        console.error("Error deleting user:", err);
        alert("Failed to delete account.");
      });
  };

  return (
    <Box>
      {/* HEADER */}
      <AppBar position="static" sx={{ bgcolor: "#fff", color: "#000" }}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: 2,
            py: 1,
          }}
        >
          <Typography
            component={Link}
            to="/"
            variant="h5"
            fontWeight="bold"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            PopOut
          </Typography>
          {user && (
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton component={Link} to="/userprofile">
                <Avatar
                  src={user.profile_picture}
                  alt={user.name}
                  sx={{ width: 40, height: 40 }}
                />
              </IconButton>
              <Button variant="outlined" href="/auth/logout" color="error">
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* BODY */}
      <Container maxWidth="md" sx={{ mt: 6 }}>
        {user ? (
          <Box>
            {/* Top: Avatar, Name, Email, Edit */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={4}
              sx={{ mb: 4 }}
              flexWrap="wrap"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={user.profile_picture}
                  alt={user.name}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                size="small"
                component={Link}
                to="/edit-profile"
              >
                Edit Profile
              </Button>
            </Stack>

            {/* Preferences Display */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Preferences:
            </Typography>

            {user.categories && user.categories.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={4}>
                {user.categories.map((cat) => (
                  <Box
                    key={cat.id}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: "8px",
                      backgroundColor: "#e0e0e0",
                      fontWeight: "bold",
                    }}
                  >
                    {cat.name}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography>No preferences selected yet.</Typography>
            )}

            {/* Navigation Buttons */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                component={Link}
                to="/bookmarks"
              >
                Bookmarked / Upcoming Events
              </Button>

              <Button
                variant="contained"
                color="info"
                fullWidth
                component={Link}
                to="/followed-vendors"
              >
                Vendors You Follow
              </Button>

              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/preferences"
              >
                User Preferences
              </Button>

              <Divider />

              <Button
                component={Link}
                to="/vendor-signup"
                variant="outlined"
                fullWidth
              >
                Become a Vendor
              </Button>

              <Button
                component={Link}
                to="/vendorprofile"
                variant="text"
                fullWidth
              >
                View Vendor Profile
              </Button>

              <Divider />

              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleDeleteUser}
              >
                Delete My Account
              </Button>
            </Stack>
          </Box>
        ) : (
          <Typography textAlign="center" mt={4}>
            No user found.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default UserProfile;