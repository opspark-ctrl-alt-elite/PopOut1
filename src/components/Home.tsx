import React from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Avatar,
  Stack,
  Container,
  IconButton,
} from "@mui/material";
import EventsFeed from "./EventsFeed";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Vendors = {
  id: string;
  businessName: string;
  email: string;
  profilePicture?: string;
  description: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}[];

type Props = {
  user: User | null;
  vendors: Vendors | null;
};

const Home: React.FC<Props> = ({ user, vendors }) => {
  return (
    <Box>
      {/* navbar */}
      <AppBar position="static" sx={{ bgcolor: "#fff", color: "#000" }}>
        <Toolbar
          sx={{
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              PopOut
            </Typography>

            {user && (
              <Button
                component={Link}
                to="/map"
                variant="outlined"
                size="small"
              >
                View Map
              </Button>
            )}
          </Stack>

          {user ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton component={Link} to="/userprofile">
                <Avatar src={user.profile_picture} alt={user.name} />
              </IconButton>
              <Button variant="outlined" href="/auth/logout" color="error">
                Logout
              </Button>
            </Stack>
          ) : (
            <Button variant="contained" href="/auth/google">
              Login with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {/* events */}
        <EventsFeed />

        {/* become vendor */}
        {user && (
          <Box mt={5} textAlign="center">
            <Button
              component={Link}
              to="/vendor-signup"
              variant="outlined"
              size="large"
            >
              Become a Vendor
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;
