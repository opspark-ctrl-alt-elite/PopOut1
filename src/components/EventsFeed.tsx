import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EventDetails from "./EventDetails";
import formatDate from "../utils/formatDate";
// import BookmarkButton from "./BookmarkButton";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import VisibilityIcon from "@mui/icons-material/Visibility";

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  isFree: boolean;
  isKidFriendly: boolean;
  isSober: boolean;
  location: string;
  vendor: {
    id: string;
    businessName: string;
    averageRating?: number;
  };
  Categories?: { name: string }[];
};

type Category = {
  id: number;
  name: string;
};

type User = {
  id: string;
  bookmarkedEvents?: Event[];
};

type Props = {
  user: User | null;
};

const EventsFeed: React.FC<Props> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    isFree: false,
    isKidFriendly: false,
    isSober: false,
  });
  const [bookmarkedEventIds, setBookmarkedEventIds] = useState<string[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchCategories = async () => {
    const res = await axios.get("/api/categories");
    setCategories(res.data.map((cat: Category) => cat.name));
  };

  const fetchEvents = useCallback(async () => {
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.isFree) params.isFree = true;
      if (filters.isKidFriendly) params.isKidFriendly = true;
      if (filters.isSober) params.isSober = true;

      const res = await axios.get("/api/events", { params });
      const data = Array.isArray(res.data) ? res.data : res.data.events;

      const now = new Date();
      const upcomingEvents = data.filter((event: Event) => {
        const eventEnd = new Date(event.endDate);
        return eventEnd >= now;
      });

      setEvents(upcomingEvents);
    } catch (err) {
      console.error("Error fetching public events:", err);
      setEvents([]);
    }
  }, [filters]);

  const fetchBookmarkedEventIds = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/users/${user.id}/bookmarked-events`);
      const bookmarkedIds = res.data.map((event: Event) => event.id);
      setBookmarkedEventIds(bookmarkedIds);
    } catch (err) {
      console.error("Failed to fetch bookmarked event IDs:", err);
    }
  };

  const handleToggleBookmark = async () => {
    await fetchBookmarkedEventIds(); // refresh after toggle
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchBookmarkedEventIds();
  }, [user]);

  const scroll = (dir: "left" | "right") => {
    const scrollAmount = 320;
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toggleChip = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenModal = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Stack spacing={2} direction="row" flexWrap="wrap" mb={4}>
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(event) =>
              setFilters((fil) => ({ ...fil, category: event.target.value }))
            }
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip
          label="Free"
          clickable
          color={filters.isFree ? "primary" : "default"}
          variant={filters.isFree ? "filled" : "outlined"}
          onClick={() => toggleChip("isFree")}
        />
        <Chip
          label="Kid-Friendly"
          clickable
          color={filters.isKidFriendly ? "primary" : "default"}
          variant={filters.isKidFriendly ? "filled" : "outlined"}
          onClick={() => toggleChip("isKidFriendly")}
        />
        <Chip
          label="Sober"
          clickable
          color={filters.isSober ? "primary" : "default"}
          variant={filters.isSober ? "filled" : "outlined"}
          onClick={() => toggleChip("isSober")}
        />
      </Stack>

      <Box sx={{ position: "relative" }}>
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
                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Hosted by{" "}
                  {event.vendor?.id ? (
                    <Link
                      to={`/vendor/${event.vendor.id}`}
                      style={{
                        color: "#1976d2",
                        textDecoration: "underline",
                      }}
                    >
                      {event.vendor.businessName}
                    </Link>
                  ) : (
                    event.vendor?.businessName
                  )}
                </Typography>

                <Typography variant="body2">{event.venue_name}</Typography>
                <Typography variant="body2">
                  {formatDate(event.startDate, event.endDate)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {event.description}
                </Typography>

                {/* chips */}
                {(event.Categories?.length ||
                  event.isFree ||
                  event.isKidFriendly ||
                  event.isSober) && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, flexWrap: "wrap" }}
                  >
                    {event.Categories?.map((cat) => (
                      <Chip
                        key={cat.name}
                        label={cat.name}
                        variant="outlined"
                        size="small"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    ))}
                    {event.isFree && (
                      <Chip
                        label="Free"
                        size="small"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    )}
                    {event.isKidFriendly && (
                      <Chip
                        label="Kid-Friendly"
                        size="small"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    )}
                    {event.isSober && (
                      <Chip
                        label="Sober"
                        size="small"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    )}
                  </Stack>
                )}

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleOpenModal(event)}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: 1,
                    backgroundColor: "#000",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#333",
                    },
                  }}
                >
                  Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* event details */}
      <EventDetails
        open={modalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </Box>
  );
};

export default EventsFeed;