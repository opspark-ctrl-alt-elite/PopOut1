import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Typography,
  Avatar,
  Container,
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
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>PopOut</Typography>

      {user ? (
        <>
          <Typography variant="h5" gutterBottom>
            Welcome, {user.name}
          </Typography>

          {user.profile_picture && (
            <Avatar
              src={user.profile_picture}
              alt="Profile"
              sx={{ width: 64, height: 64, mb: 2 }}
            />
          )}

          <Stack spacing={1} direction="column" sx={{ maxWidth: 400, mb: 3 }}>
            <Button
              variant="contained"
              size="small"
              component={Link}
              to="/edit-profile"
              sx={{
                textTransform: 'none',
                '&:hover': {
                  boxShadow: '0 0 10px rgba(0, 123, 255, 0.8)'
                }
              }}
            >
              Edit Profile
            </Button>

            <Button
              variant="outlined"
              size="small"
              component={Link}
              to="/preferences"
              sx={{
                textTransform: 'none',
                '&:hover': {
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              User Preferences
            </Button>

            <Button
              variant="contained"
              size="small"
              color="secondary"
              component={Link}
              to="/bookmarks"
              sx={{
                textTransform: 'none',
                '&:hover': {
                  boxShadow: '0 0 10px rgba(156, 39, 176, 0.8)'
                }
              }}
            >
              Bookmarked / Upcoming Events
            </Button>

            <Button
              variant="outlined"
              size="small"
              color="error"
              component={Link}
              to="/followed-vendors"
              sx={{
                textTransform: 'none',
                '&:hover': {
                  boxShadow: '0 0 10px rgba(244, 67, 54, 0.6)'
                }
              }}
            >
              Vendors You Follow
            </Button>
          </Stack>

          <Box>
            <Button component={Link} to="/auth/logout" color="secondary" size="small">
              Logout
            </Button>
            <Button component={Link} to="/" color="secondary" size="small" sx={{ ml: 2 }}>
              Home
            </Button>
            <Button component={Link} to="/vendorprofile" color="secondary" size="small" sx={{ ml: 2 }}>
              View Vendor Profile
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="body1">No user found</Typography>
      )}
    </Container>
  );
};

export default UserProfile;