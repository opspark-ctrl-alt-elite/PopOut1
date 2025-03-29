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
  console.log(user);
  console.log(vendors);
  return (
    <Box>
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
        {user && (
          <Stack spacing={2}>
            <Button component={Link} to="/userprofile" variant="outlined">
              View User Profile
            </Button>
            <Button component={Link} to="/vendorprofile" variant="outlined">
              View Vendor Profile
            </Button>
            <Button component={Link} to="/vendor-signup" variant="outlined">
              Become a Vendor
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default Home;
