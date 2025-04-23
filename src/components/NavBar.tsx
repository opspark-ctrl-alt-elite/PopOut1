import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Popover,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  ListItemIcon,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import RoomIcon from "@mui/icons-material/Room";
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
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [notificationsAnchorEl, setNotificationsAnchorEl] =
    useState<null | HTMLElement>(null);
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

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
    setProfileAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
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
            flexWrap: "nowrap",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1,
            overflow: "hidden",
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
              variant="h4"
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
              startIcon={<RoomIcon />}
              sx={{
                backdropFilter: "blur(6px)",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                border: "1px solid rgba(0, 0, 0, 0.2)",
                borderRadius: "16px",
                px: 2,
                color: "#000",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                },
              }}
            >
              Map
            </Button>
            )}
          </Stack>

          {/* search bar */}
          <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
            <SearchBar
              onResults={(data) => {
                console.log("search results", data);
              }}
            />
          </Box>

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
        <Box sx={{ p: 1.5, width: 200 }}>
          <Typography
            variant="h5"
            sx={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>

          <Divider sx={{ my: 1 }} />

          {/* links */}
          <Link
            to="/userprofile"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={handleProfileClose}
          >
            <ListItem button sx={{ paddingLeft: 0 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <PersonIcon sx={{ color: "#1e88e5" }} />
              </ListItemIcon>
              <ListItemText primary="User Profile" sx={{ marginLeft: 1 }} />
            </ListItem>
          </Link>

          {user?.is_vendor && (
            <Link
              to="/vendorprofile"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={handleProfileClose}
            >
              <ListItem button sx={{ paddingLeft: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <WorkIcon sx={{ color: "#43a047" }} />
                </ListItemIcon>
                <ListItemText primary="Vendor Profile" sx={{ marginLeft: 1 }} />
              </ListItem>
            </Link>
          )}

          <ListItem button onClick={handleLogout} sx={{ paddingLeft: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <LogoutIcon sx={{ color: "#e53935" }} />
            </ListItemIcon>
            <ListItemText primary="Log Out" sx={{ marginLeft: 1 }} />
          </ListItem>
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
        <Box sx={{ p: 2, minWidth: 150 }}>
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
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          transition: "transform 0.3s ease",
          "& .MuiDrawer-paper": {
            width: 250,
            bgcolor: "#000",
            color: "#fff",
            paddingTop: 2,
            paddingBottom: 0,
          },
        }}
      >
        <Box
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List sx={{ paddingTop: 2 }}>
            {/* Home */}
            <ListItem
              component={Link}
              to="/"
              button
              sx={{ "&:hover": { bgcolor: "#444" } }}
            >
              <ListItemText
                primary="Home"
                sx={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}
              />
            </ListItem>

            {user && !user.is_vendor && (
              <ListItem
                component={Link}
                to="/vendor-signup"
                button
                sx={{ "&:hover": { bgcolor: "#444" } }}
              >
                <ListItemText
                  primary="Become a Vendor"
                  sx={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}
                />
              </ListItem>
            )}

            <ListItem
              component={Link}
              to="/game"
              button
              sx={{ "&:hover": { bgcolor: "#444" } }}
            >
              <ListItemText
                primary="Play Game"
                sx={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}
              />
            </ListItem>

            <ListItem
              component={Link}
              to="/map"
              button
              sx={{ "&:hover": { bgcolor: "#444" } }}
            >
              <ListItemText
                primary="View Map"
                sx={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}
              />
            </ListItem>

            {!user && (
              <ListItem
                component="a"
                href="/auth/google"
                button
                sx={{ "&:hover": { bgcolor: "#444" } }}
              >
                <ListItemText
                  primary="Login with Google"
                  sx={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
