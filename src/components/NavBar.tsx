import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Avatar,
  Stack,
  IconButton,
  Popover,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { onMessageListener } from "../firebase/onMessageListener";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
    is_vendor: boolean;
  } | null;
  notifications: any[];
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

const Navbar: React.FC<Props> = ({
  user,
  notifications = [],
  unreadCount,
  setUnreadCount,
  setNotifications,
}) => {
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    onMessageListener().then((payload: any) => {
      setNotifications((prev) => [payload.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  }, [setNotifications, setUnreadCount]);


  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
    setNotificationsAnchorEl(null);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  // Notifications dropdown logic
  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
    setProfileAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    // Logic to handle logout
    window.location.href = "/auth/logout";
  };

  const openProfile = Boolean(profileAnchorEl);
  const openNotifications = Boolean(notificationsAnchorEl);

  // side nav
  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  return (
    <>
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
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              component={Link}
              to="/"
              variant="h5"
              fontWeight="bold"
              sx={{
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              PopOut
            </Typography>

            {user && (
              <Button
                component={Link}
                to="/map"
                variant="outlined"
                size="small"
                sx={{
                  color: "black",
                  borderColor: "black",
                  "&:hover": {
                    borderColor: "black",
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                View Map
              </Button>
            )}
          </Stack>

          {user ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={handleBellClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <IconButton onClick={handleProfileClick}>
                <Avatar src={user.profile_picture} alt={user.name} />
              </IconButton>
            </Stack>
          ) : (
            <Button variant="contained" href="/auth/google">
              Login with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* profile dropdown */}
      <Popover
        open={openProfile}
        anchorEl={profileAnchorEl}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2">{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>

          <Divider sx={{ my: 1 }} />

          {/* Profile Links */}
          <Link to="/userprofile" style={{ textDecoration: "none", color: "inherit" }}>
            <Button fullWidth variant="text">View Profile</Button>
          </Link>

          {user?.is_vendor && (
            <Link to="/vendorprofile" style={{ textDecoration: "none", color: "inherit" }}>
              <Button fullWidth variant="text">View Vendor Profile</Button>
            </Link>
          )}

          {/* Logout Button */}
          <Button fullWidth variant="outlined" color="error" onClick={handleLogout} sx={{ mt: 2 }}>
            Log Out
          </Button>
        </Box>
      </Popover>

      {/* notifs */}
      <Popover
        open={openNotifications}
        anchorEl={notificationsAnchorEl}
        onClose={handleNotificationsClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
          {notifications.length === 0 ? (
            <Typography variant="body2">No new notifications</Typography>
          ) : (
            notifications.map((n, i) => (
              <Box key={i} sx={{ my: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {n.title}
                </Typography>
                <Typography variant="body2">{n.body}</Typography>
              </Box>
            ))
          )}
        </Box>
      </Popover>

      {/* sidenav */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem component={Link} to="/" button>
              <ListItemText primary="Home" />
            </ListItem>

            {user && !user.is_vendor && (
              <ListItem component={Link} to="/vendor-signup" button>
                <ListItemText primary="Become a Vendor" />
              </ListItem>
            )}

            <ListItem component={Link} to="/game" button>
              <ListItemText primary="Play Game" />
            </ListItem>

            {user && (
              <>
                <ListItem component={Link} to="/map" button>
                  <ListItemText primary="View Map" />
                </ListItem>
                <ListItem component={Link} to="/userprofile" button>
                  <ListItemText primary="Profile" />
                </ListItem>
              </>
            )}

            {!user && (
              <ListItem component="a" href="/auth/google" button>
                <ListItemText primary="Login with Google" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
