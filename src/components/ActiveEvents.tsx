import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Container,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  Categories?: { name: string }[];
};

const ActiveEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/api/events/my-events");
      console.log("fetched events", res.data);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch vendor events:", err);
      setEvents([]);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await axios.delete(`/api/events/${eventId}`);
      fetchEvents(); // refresh after deletion
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
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
  );
};

export default ActiveEvents;
