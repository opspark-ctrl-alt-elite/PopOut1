// ActiveEvents.tsx
import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";

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
  const [user, setUser] = useState<User | null>(null);

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
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch vendor events:", err);
      setEvents([]);
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

  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static" sx={{ bgcolor: "#fff", color: "#000" }}>
        <Toolbar sx={{ justifyContent: "space-between", px: 2, py: 1 }}>
          <Typography
            component={Link}
            to="/"
            variant="h5"
            fontWeight="bold"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            PopOut
          </Typography>
          {user && (
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton component={Link} to="/userprofile">
                <Avatar
                  src={user.profile_picture}
                  alt={user.name}
                  sx={{ width: 40, height: 40 }}
                />
              </IconButton>
              <Button variant="outlined" href="/auth/logout" color="error">
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
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
              <IconButton href="#" sx={{ color: "#1877F2" }} aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton href="#" sx={{ color: "#C13584" }} aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton href="#" sx={{ color: "#34A853" }} aria-label="Website">
                <LanguageIcon />
              </IconButton>
              <Button variant="outlined" size="small" component={Link} to="/vendorprofile">
                Back to Vendor Profile
              </Button>
            </Stack>
          </Stack>
        </Container>
      )}
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          My Events
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={3}>
          {events.length === 0 ? (
            <Typography>No events created yet.</Typography>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardContent>
                  {event.image_url && (
                    <Box mb={2}>
                      <img
                        src={event.image_url}
                        alt={event.title}
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
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
                      Categories:{" "}
                      {event.Categories.map((cat) => cat.name).join(", ")}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
            ))
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default ActiveEvents;
