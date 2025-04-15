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
  Card,
  CardContent,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EventsFeed from "./EventsFeed";
import { onMessageListener } from "../firebase/onMessageListener";
import axios from "axios";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  is_vendor: boolean;
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

type Captcha = {
  beatCaptcha: boolean;
  wantsToBeVendor: boolean;
};

type SpotlightVendor = {
  id: string;
  businessName: string;
  description: string;
  averageRating: number;
};

type Props = {
  user: User | null;
  vendors: Vendors | null;
  captcha: Captcha;
  setCaptcha: Function;
};

const Home: React.FC<Props> = ({ user, vendors, captcha, setCaptcha }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightVendor[]>([]);

  useEffect(() => {
    onMessageListener().then((payload: any) => {
      setNotifications((prev) => [payload.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // create an interval to call changeColorInd every half second
    const interval = setInterval(changeColorInd, 500);

    // set captcha's "wantsToBeVendor" flag to false
    setCaptcha((prev: Captcha) => ({
      beatCaptcha: prev.beatCaptcha,
      wantsToBeVendor: false,
    }));

    // Fetch vendor spotlight data from /vendors/spotlight/top3
    const fetchSpotlight = async () => {
      try {
        // First get spotlight vendors from the spotlight endpoint.
        const res = await axios.get("/vendors/spotlight/top3", {
          withCredentials: true,
        });
        const spotlightData = Array.isArray(res.data) ? res.data : [];
        // For each vendor, fetch its average rating from the same endpoint used in PublicVendorProfile.
        const spotlightWithRatings = await Promise.all(
          spotlightData.map(async (vendor: any) => {
            try {
              const ratingRes = await axios.get(`/vendors/${vendor.id}/average-rating`);
              // Expecting { averageRating: number, reviewCount: number } from this endpoint.
              const avg = parseFloat(ratingRes.data.averageRating);
              return {
                ...vendor,
                averageRating: !isNaN(avg) ? avg : 0,
              };
            } catch (error) {
              console.error(`Error fetching rating for vendor ${vendor.id}:`, error);
              return {
                ...vendor,
                averageRating: 0,
              };
            }
          })
        );
        setSpotlight(spotlightWithRatings);
      } catch (error) {
        console.error("Error fetching vendor spotlight:", error);
      }
    };
    fetchSpotlight();

    return () => {
      clearInterval(interval);
    };
  }, [setCaptcha]);

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Array of colors for game button
  const colorArray = [
    "red",
    "orange",
    "darkgoldenrod",
    "green",
    "blue",
    "darkblue",
    "violet",
    "purple",
    "maroon",
  ];

  const [gameButtonColorInd, setGameButtonColorInd] = useState(0);
  const changeColorInd = () => {
    setGameButtonColorInd((prev) => {
      let newIndex = prev + 1;
      if (newIndex >= colorArray.length) newIndex = 0;
      return newIndex;
    });
  };

  return (
    <Box>
      {/* Navbar */}
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
              <Button component={Link} to="/map" variant="outlined" size="small">
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

      {/* Notification List */}
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

      {/* Events Section */}
      <Container sx={{ mt: 4 }}>
        <EventsFeed user={null} />
        {user && !user.is_vendor && (
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
        {user && (
          <Box mt={5} textAlign="center">
            <Button
              component={Link}
              to="/game"
              variant="outlined"
              size="large"
              sx={{
                color: colorArray[gameButtonColorInd],
                borderColor: colorArray[gameButtonColorInd],
              }}
            >
              Play Game
            </Button>
          </Box>
        )}
      </Container>

      {/* Vendor Spotlight Section - MOVED TO BOTTOM */}
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Vendor Spotlight
        </Typography>
        {spotlight.length > 0 ? (
          spotlight.map((vendor) => (
            <Card key={vendor.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{vendor.businessName}</Typography>
                <Typography variant="body2">
                  Average Rating:{" "}
                  {typeof vendor.averageRating === "number"
                    ? Number(vendor.averageRating).toFixed(1)
                    : "N/A"}
                </Typography>
                <Typography variant="body2">{vendor.description}</Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No vendors in spotlight.</Typography>
        )}
      </Container>
    </Box>
  );
};

export default Home;
