import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  IconButton,
  Stack,
  Card,
  CardContent,
  Container,
  Divider,
  Box,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  image_url?: string;
  Categories?: { name: string }[];
};

const ActiveEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const upcomingScrollRef = useRef<HTMLDivElement>(null);
  const pastScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
    fetchEvents();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/me", { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/api/events/my-events");
      const allEvents = Array.isArray(res.data) ? res.data : [];

      const now = new Date();
      const upcoming = allEvents.filter(
        (event) => new Date(event.endDate) >= now
      );
      const past = allEvents.filter(
        (event) => new Date(event.endDate) < now
      );

      setEvents(upcoming);
      setPastEvents(past);
    } catch (err) {
      console.error("Failed to fetch vendor events:", err);
      setEvents([]);
      setPastEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await axios.delete(`/api/events/${eventId}`);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const scroll = (direction: "left" | "right", ref: React.RefObject<HTMLDivElement>) => {
    const scrollAmount = 320;
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id} sx={{ minWidth: 300, maxWidth: 300, boxShadow: 3 }}>
      <CardContent>
        {event.image_url && (
          <Box mb={2}>
            <img
              src={event.image_url}
              alt={event.title}
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "6px",
              }}
            />
          </Box>
        )}
        <Typography variant="h6">{event.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {event.venue_name}
        </Typography>
        <Typography variant="body2">
          {new Date(event.startDate).toLocaleString()} —{" "}
          {new Date(event.endDate).toLocaleString()}
        </Typography>
        {event.Categories && event.Categories.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Categories: {event.Categories.map((cat) => cat.name).join(", ")}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            component={Link}
            to={`/edit-event/${event.id}`}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => deleteEvent(event.id)}
          >
            Delete
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderScrollableEvents = (
    eventList: Event[],
    scrollRef: React.RefObject<HTMLDivElement>,
    label: string
  ) => (
    <Box sx={{ position: "relative", mt: 2 }}>
      <IconButton
        onClick={() => scroll("left", scrollRef)}
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
        onClick={() => scroll("right", scrollRef)}
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
        {eventList.length === 0 ? (
          <Typography>No {label.toLowerCase()} events.</Typography>
        ) : (
          eventList.map(renderEventCard)
        )}
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Profile Info */}
      {user && (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            sx={{ mb: 4 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={user.profile_picture}
                alt={user.name}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton href="#" sx={{ color: "#1877F2" }}>
                <FacebookIcon />
              </IconButton>
              <IconButton href="#" sx={{ color: "#C13584" }}>
                <InstagramIcon />
              </IconButton>
              <IconButton href="#" sx={{ color: "#34A853" }}>
                <LanguageIcon />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                component={Link}
                to="/vendorprofile"
              >
                Back to Vendor Profile
              </Button>
            </Stack>
          </Stack>
        </Container>
      )}

      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Upcoming Events" />
          <Tab label="Past Events" />
        </Tabs>

        {loading ? (
          <CircularProgress />
        ) : tabIndex === 0 ? (
          renderScrollableEvents(events, upcomingScrollRef, "Upcoming")
        ) : (
          renderScrollableEvents(pastEvents, pastScrollRef, "Past")
        )}
      </Container>
    </Box>
  );
};

export default ActiveEvents;