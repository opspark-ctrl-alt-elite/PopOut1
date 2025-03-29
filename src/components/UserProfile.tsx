import React from "react";
import { Link } from "react-router-dom";
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

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Props = {
  user: User | null;
};

const UserProfile: React.FC<Props> = ({ user }) => {
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

      <Container maxWidth="md" sx={{ mt: 6 }}>
        {user ? (
          <Box>
            {/* PROFILE */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={4}
              sx={{ mb: 4 }}
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

              <Button variant="outlined" size="small">
                Edit Profile
              </Button>
            </Stack>
            <Stack spacing={2}>
              <Button variant="contained" color="success" fullWidth>
                Bookmarked / Upcoming Events
              </Button>
              <Button variant="contained" color="info" fullWidth>
                Vendors You Follow
              </Button>
              <Button variant="contained" fullWidth>
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
