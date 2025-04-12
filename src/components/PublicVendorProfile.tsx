import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Button,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import Navbar from "./NavBar";
import formatDate from "../utils/formatDate";

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  } | null;
};

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  Categories?: { name: string }[];
};

type Vendor = {
  businessName: string;
  description: string;
  profilePicture?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  email?: string;
};

const PublicVendorProfile: React.FC<Props> = ({ user }) => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const scrollAmount = 320;
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchVendorEvents = async () => {
      try {
        const res = await axios.get(`/api/events/vendor/${vendorId}`);
        setEvents(res.data);
      } catch (err) {
        console.error("err fetching vendor events", err);
        setEvents([]);
      }
    };

    const fetchVendorInfo = async () => {
      try {
        const res = await axios.get(`/api/vendor/public/${vendorId}`);
        setVendor(res.data);
      } catch (err) {
        console.error("err fetching vendor info", err);
        setVendor(null);
      }
    };

    const fetchVendorImage = async () => {
      try {
        const res = await axios.get(`/api/images/vendorId/${vendorId}`);
        if (res.data?.length > 0) {
          setUploadedImage(res.data[0].referenceURL);
        }
      } catch (err) {
        console.error("err fetching vendor image", err);
      }
    };

    const checkFollowStatus = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`/users/${user.id}/follows/${vendorId}`);
        const { isFollowing } = res.data;
        setIsFollowing(isFollowing);
      } catch (err) {
        console.error("Error checking follow status", err);
        setIsFollowing(false);
      }
    };

    if (vendorId) {
      fetchVendorEvents();
      fetchVendorInfo();
      fetchVendorImage();
      if (user) checkFollowStatus();
      setLoading(true);
      setTimeout(() => setLoading(false), 300);
    }
  }, [vendorId, user]);

  const handleFollowToggle = () => {
    if (!user) return;
    const route = isFollowing
      ? `/users/${user.id}/unfollow/${vendorId}`
      : `/users/${user.id}/follow/${vendorId}`;
    axios
      .post(route)
      .then((res) => {
        console.log(res.data.message);
        setIsFollowing(!isFollowing);
      })
      .catch((err) => console.error("Error toggling follow", err));
  };

  return (
    <>
      <Navbar user={user} />

      <Box sx={{ p: 4 }}>
        {vendor && (
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={uploadedImage || vendor.profilePicture || ""}
                alt={vendor.businessName}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {vendor.businessName}
                </Typography>
                {vendor.email && (
                  <Typography variant="body2" color="text.secondary">
                    {vendor.email}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              {vendor.facebook && (
                <IconButton
                  component="a"
                  href={vendor.facebook}
                  target="_blank"
                >
                  <FacebookIcon color="primary" />
                </IconButton>
              )}
              {vendor.instagram && (
                <IconButton
                  component="a"
                  href={vendor.instagram}
                  target="_blank"
                >
                  <InstagramIcon sx={{ color: "#d62976" }} />
                </IconButton>
              )}
              {vendor.website && (
                <IconButton component="a" href={vendor.website} target="_blank">
                  <LanguageIcon sx={{ color: "#4caf50" }} />
                </IconButton>
              )}
              {user && (
                <Button variant="outlined" onClick={handleFollowToggle}>
                  {isFollowing ? "Unfollow" : "Follow"} Vendor
                </Button>
              )}
            </Stack>
          </Stack>
        )}

        {vendor?.description && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            {vendor.description}
          </Typography>
        )}

        <Typography variant="h4" gutterBottom>
          Upcoming Events
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : events.length === 0 ? (
          <Typography>No events</Typography>
        ) : (
          <Box sx={{ position: "relative", mt: 2 }}>
            {/* Arrows */}
            <IconButton
              onClick={() => scroll("left")}
              sx={{
                position: "absolute",
                top: "35%",
                left: 0,
                zIndex: 2,
                bgcolor: "#fff",
                boxShadow: 2,
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>

            <IconButton
              onClick={() => scroll("right")}
              sx={{
                position: "absolute",
                top: "35%",
                right: 0,
                zIndex: 2,
                bgcolor: "#fff",
                boxShadow: 2,
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>

            {/* events */}
            <Box
              ref={scrollRef}
              sx={{
                display: "flex",
                gap: 3,
                py: 2,
                px: 5,
                overflowX: "scroll",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {events.map((event) => (
                <Card
                  key={event.id}
                  sx={{
                    minWidth: 300,
                    maxWidth: 300,
                    flex: "0 0 auto",
                    boxShadow: 3,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.venue_name}
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(event.startDate, event.endDate)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {event.description}
                    </Typography>
                    {event.Categories && event.Categories.length > 0 && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Categories:{" "}
                        {event.Categories.map((cat) => cat.name).join(", ")}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default PublicVendorProfile;
