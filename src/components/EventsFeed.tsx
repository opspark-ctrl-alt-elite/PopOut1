import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import formatDate from "../utils/formatDate";

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
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

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
  vendor: {
    id: string;
    businessName: string;
  };
};

const EventsFeed: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    isFree: false,
    isKidFriendly: false,
    isSober: false,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get("/api/categories");
    setCategories(res.data.map((cat: any) => cat.name));
  };

  const fetchEvents = async () => {
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.isFree) params.isFree = true;
      if (filters.isKidFriendly) params.isKidFriendly = true;
      if (filters.isSober) params.isSober = true;

      const res = await axios.get("/api/events", { params });
      const data = res.data;

      if (Array.isArray(data)) {
        setEvents(data);
      } else if (Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching public events:", err);
      setEvents([]);
    }
  };

  const scroll = (dir: "left" | "right") => {
    const scrollAmount = 320;
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      {/* filters */}
      <Stack spacing={2} direction="row" flexWrap="wrap" mb={4}>
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) =>
              setFilters((f) => ({ ...f, category: e.target.value }))
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

        <FormControlLabel
          control={
            <Checkbox
              checked={filters.isFree}
              onChange={(e) =>
                setFilters((f) => ({ ...f, isFree: e.target.checked }))
              }
              size="small"
            />
          }
          label="Free"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.isKidFriendly}
              onChange={(e) =>
                setFilters((f) => ({ ...f, isKidFriendly: e.target.checked }))
              }
              size="small"
            />
          }
          label="Kid-Friendly"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.isSober}
              onChange={(e) =>
                setFilters((f) => ({ ...f, isSober: e.target.checked }))
              }
              size="small"
            />
          }
          label="Sober"
        />

        <Button
          onClick={fetchEvents}
          variant="contained"
          size="small"
          sx={{ height: 30 }}
        >
          Filter
        </Button>
      </Stack>

      {/* events */}
      <Box sx={{ position: "relative" }}>
        {/* arrows */}
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

        {/* scroller */}
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
                  {event.isFree && "Free "}
                  {event.isKidFriendly && "· Kid-Friendly "}
                  {event.isSober && "· Sober"}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => alert(`TODO: Show details for ${event.title}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default EventsFeed;
