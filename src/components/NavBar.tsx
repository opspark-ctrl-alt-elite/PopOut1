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
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Tooltip from "@mui/material/Tooltip";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { onMessageListener } from "../firebase/onMessageListener";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  } | null;
}

const Navbar: React.FC<Props> = ({ user }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    onMessageListener().then((payload: any) => {
      setNotifications((prev) => [payload.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  }, []);

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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

              <IconButton component={Link} to="/userprofile">
                <Avatar src={user.profile_picture} alt={user.name} />
              </IconButton>

              <Tooltip title="Logout">
                <IconButton href="/auth/logout" color="error" sx={{ ml: 1 }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Button variant="contained" href="/auth/google">
              Login with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
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
    </>
  );
};

export default Navbar;
