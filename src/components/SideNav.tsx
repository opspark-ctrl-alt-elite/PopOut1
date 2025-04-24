import React from "react";
import { Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";

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
              textShadow: "1px 1px 4px rgba(0,0,0,0.3)"
            }}
          >
            PopOut
          </Typography>
        </Box>

        <List>
          {navItems.map(({ label, path }) => (
            <ListItem
              key={label}
              component={Link}
              to={path}
              button
              dense
              sx={{
                py: 1,
                px: 2,
                "&:hover": { bgcolor: "#444" },
              }}
            >
              <ListItemText {...listTextStyles} primary={label} />
            </ListItem>
          ))}

          {!user && (
            <ListItem
              component="a"
              href="/auth/google"
              button
              dense
              sx={{ py: 1, px: 2, "&:hover": { bgcolor: "#444" } }}
            >
              <ListItemText {...listTextStyles} primary="Login with Google" />
            </ListItem>
          )}

          {user && !user.is_vendor && (
            <ListItem
              component={Link}
              to="/vendor-signup"
              button
              dense
              sx={{ py: 1, px: 2, "&:hover": { bgcolor: "#444" } }}
            >
              <ListItemText {...listTextStyles} primary="Become a Vendor" />
            </ListItem>
          )}

          {user && (
            <ListItem
              button
              onClick={handleLogout}
              dense
              sx={{ py: 1, px: 2, "&:hover": { bgcolor: "#444" } }}
            >
              <ListItemText {...listTextStyles} primary="Log Out" />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideNav;
