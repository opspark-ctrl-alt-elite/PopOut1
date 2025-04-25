import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import SideNav from "./SideNav";

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
// import RoomIcon from "@mui/icons-material/Room";
import SvgIcon from "@mui/material/SvgIcon";
import { onMessageListener } from "../firebase/onMessageListener";
import Lottie from "lottie-react";
// import locationPinAnimation from "../assets/lottie/monoicon.json";
import blueLocationPin from "../assets/lottie/blueicon.json";
import Logo from "../assets/logo/popout.png";

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

  function GoogleIcon(props: any) {
    return (
      <SvgIcon {...props}>
        <path d="M21.35 11.1h-9.18v2.92h5.3c-.23 1.27-1.36 3.7-5.3 3.7-3.19 0-5.8-2.63-5.8-5.86s2.61-5.86 5.8-5.86c1.81 0 3.02.77 3.72 1.43l2.55-2.48C17.64 3.83 15.2 2.8 12.5 2.8 7.91 2.8 4.24 6.53 4.24 11s3.67 8.2 8.26 8.2c4.77 0 7.92-3.36 7.92-8.08 0-.52-.07-1.02-.17-1.52z" />
      </SvgIcon>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#fff", color: "#000" }}>
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "nowrap",
            overflow: "hidden",
            minWidth: 0,
            px: 2,
            py: 1,
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center"
          sx={{ flexShrink: 1, minWidth: 0 }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <img
                src={Logo}
                alt="PopOut Logo"
                style={{
                  height: "30px",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Link>

            {user && (
              <Button
                component={Link}
                to="/map"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "rgba(240, 240, 240, 0.4)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.2), 0 3px 8px rgba(0,0,0,0.08)",
                  borderRadius: "999px",
                  px: 2,
                  py: 0.8,
                  color: "#000",
                  // fontFamily: `'Barlow Semi Condensed', sans-serif`,
                  // fontFamily: `'IBM Plex Sans', sans-serif`,
                  // fontFamily: `'Work Sans', sans-serif`,
                  fontFamily: `'DM Sans', sans-serif`,
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(240, 240, 240, 0.6)",
                    borderColor: "rgba(0, 0, 0, 0.25)",
                    boxShadow:
                      "inset 0 0 0 1px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.1)",
                    "& .scale-icon": {
                      transform: "scale(1.4)",
                    },
                  },
                }}
              >
                <Box
                  className="scale-icon"
                  sx={{
                    width: 24,
                    height: 24,
                    transition: "transform 0.3s ease",
                  }}
                >
                  <Lottie animationData={blueLocationPin} loop autoplay />
                </Box>
                Map
              </Button>
            )}
          </Stack>

          {/* search bar */}
          <Box sx={{ flexGrow: 1, maxWidth: 400, minWidth: 0 }}>
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
            <Box
              component="a"
              href="/auth/google"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                backgroundColor: "#000",
                border: "1px solid #000",
                borderRadius: "999px",
                padding: "8px 20px",
                // fontWeight: "bold",
                fontSize: "1.1rem",
                // fontFamily: "'Bebas Neue', sans-serif",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 500,
                color: "#fff",
                transition: "background-color 0.2s, box-shadow 0.2s",
                "&:hover": {
                  backgroundColor: "#111",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Box
                component="span"
                sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="20"
                  height="20"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
              </Box>
              Sign In
            </Box>
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
      <SideNav
        user={user}
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
