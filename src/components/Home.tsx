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
  Container,
  IconButton,
  Popover,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EventsFeed from "./EventsFeed";
import { onMessageListener } from '../firebase/onMessageListener';

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





  // create array of colors to loop through
  const colorArray = ["red", "orange", "yellow", "green", "cyan", "blue", "violet", "purple", "maroon"];

  // create index in state for current color for game button
  const [gameButtonColorInd, setGameButtonColorInd] = useState(0);

  // set interval on first render
  useEffect(() => {
    // call changeColorInd every half second
      setInterval(changeColorInd, 500);
    }, []);
  
    // set the game button color index in state to the next index in the color array
    const changeColorInd = () => {
      console.log("tug");
      setGameButtonColorInd(prev => {
        prev++;
        // reset index to 0 if the game button color index goes past the last color index in the color array
        if (prev >= colorArray.length) {
          return 0;
        }
        return prev;
      })
    }

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
              {/* notification */}
              <IconButton onClick={handleBellClick}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* avatar */}
              <IconButton component={Link} to="/userprofile">
                <Avatar src={user.profile_picture} alt={user.name} />
              </IconButton>

              {/* logout */}
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

      {/* notification list */}
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

      {/* events */}
      <Container sx={{ mt: 4 }}>
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

        {/* play game */}
        {user && (
          <Box mt={5} textAlign="center">
            <Button
              component={Link}
              to="/game"
              variant="outlined"
              size="large"
              sx={{ color: colorArray[gameButtonColorInd], borderColor: colorArray[gameButtonColorInd] }}
            >
              Play Maze Game
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;
