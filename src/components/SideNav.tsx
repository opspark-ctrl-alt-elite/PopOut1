import React from "react";
import { Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Room";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import StorefrontIcon from "@mui/icons-material/Storefront";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
    is_vendor: boolean;
  } | null;
  drawerOpen: boolean;
  toggleDrawer: (
    open: boolean
  ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
  handleLogout: () => void;
}

const SideNav: React.FC<Props> = ({
  user,
  drawerOpen,
  toggleDrawer,
  handleLogout,
}) => {
  const listTextStyles = {
    primaryTypographyProps: {
      fontSize: "0.9rem",
      fontWeight: 500,
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
    },
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "View Map", path: "/map" },
    ...(user ? [{ label: "User Profile", path: "/userprofile" }] : []),
    ...(user?.is_vendor
      ? [{ label: "Vendor Profile", path: "/vendorprofile" }]
      : []),
    { label: "Play Game", path: "/game" },
  ];

  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      sx={{
        "& .MuiDrawer-paper": {
          width: 200,
          bgcolor: "rgba(0, 0, 0, 0.8)",
          color: "#fff",
          paddingTop: 2,
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <Box
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
            px: 2,
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              color: "#fff",
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "1px",
              textShadow: "1px 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            PopOut
          </Typography>
        </Box>

        <List>
          <ListItem component={Link} to="/" button dense>
            <ListItemIcon sx={{ color: "#fff", minWidth: 32 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText {...listTextStyles} primary="Home" />
          </ListItem>

          <ListItem component={Link} to="/map" button dense>
            <ListItemIcon sx={{ color: "#fff", minWidth: 32 }}>
              <MapIcon />
            </ListItemIcon>
            <ListItemText {...listTextStyles} primary="View Map" />
          </ListItem>

          {user && (
            <ListItem component={Link} to="/userprofile" button dense>
              <ListItemIcon sx={{ color: "#fff", minWidth: 32 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText {...listTextStyles} primary="User Profile" />
            </ListItem>
          )}

          {user?.is_vendor && (
            <ListItem component={Link} to="/vendorprofile" button dense>
              <ListItemIcon sx={{ color: "#fff", minWidth: 32 }}>
                <WorkIcon />
              </ListItemIcon>
              <ListItemText {...listTextStyles} primary="Vendor Profile" />
            </ListItem>
          )}

          <ListItem component={Link} to="/game" button dense>
            <ListItemIcon sx={{ color: "#fff", minWidth: 32 }}>
              <SportsEsportsIcon />
            </ListItemIcon>
            <ListItemText {...listTextStyles} primary="Play Game" />
          </ListItem>

          {!user && (
            <ListItem component="a" href="/auth/google" button dense>
              <ListItemIcon sx={{ color: "#fff", minWidth: 32 }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText {...listTextStyles} primary="Sign in with Google" />
            </ListItem>
          )}

          {user && !user.is_vendor && (
            <ListItem component={Link} to="/vendor-signup" button dense>
              <ListItemIcon sx={{ color: "#fff", minWidth: 32 }}>
                <StorefrontIcon />
              </ListItemIcon>
              <ListItemText {...listTextStyles} primary="Become a Vendor" />
            </ListItem>
          )}

          {user && (
            <ListItem button onClick={handleLogout} dense>
              <ListItemIcon sx={{ color: "#fff", minWidth: 32 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText {...listTextStyles} primary="Log Out" />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideNav;
