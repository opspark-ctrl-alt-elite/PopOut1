import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import EventDetails from "./EventDetails";
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
  Chip,
  IconButton,
  Button,
  Fade,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PlaceIcon from "@mui/icons-material/Place";

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  image_url?: string;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const itemsPerPage = isMobile ? 2 : 3;
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

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
      const upcomingEvents = data.filter(
        (event: Event) => new Date(event.endDate) >= now
      );

      setEvents(upcomingEvents);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error fetching popups:", err);
      setEvents([]);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // useEffect(() => {
  //   const hasFilters =
  //     filters.category !== "" ||
  //     filters.isFree ||
  //     filters.isKidFriendly ||
  //     filters.isSober;

  //   if (isMobile || modalOpen || isHovered || hasFilters) {
  //     if (autoScrollTimerRef.current) {
  //       clearInterval(autoScrollTimerRef.current);
  //       autoScrollTimerRef.current = null;
  //     }
  //     return;
  //   }

  //   if (autoScrollTimerRef.current) {
  //     clearInterval(autoScrollTimerRef.current);
  //   }

  //   autoScrollTimerRef.current = setInterval(() => {
  //     setCurrentIndex((prev) => {
  //       if (prev + itemsPerPage >= events.length) {
  //         return 0;
  //       } else {
  //         return prev + itemsPerPage;
  //       }
  //     });
  //   }, 15000);

  //   return () => {
  //     if (autoScrollTimerRef.current) {
  //       clearInterval(autoScrollTimerRef.current);
  //     }
  //   };
  // }, [events.length, itemsPerPage, isHovered, modalOpen, filters, isMobile]);

  useEffect(() => {
    const hasFilters =
      filters.category !== "" ||
      filters.isFree ||
      filters.isKidFriendly ||
      filters.isSober;

    if (isMobile || modalOpen || isHovered || hasFilters || hasUserInteracted) {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
      return;
    }

    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }

    autoScrollTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + itemsPerPage >= events.length) {
          return 0;
        } else {
          return prev + itemsPerPage;
        }
      });
    }, 15000);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [
    events.length,
    itemsPerPage,
    isHovered,
    modalOpen,
    filters,
    isMobile,
    hasUserInteracted,
  ]);

  // const handleArrowClick = (direction: "left" | "right") => {
  //   setCurrentIndex((prev) => {
  //     if (direction === "left") {
  //       return prev === 0
  //         ? Math.max(events.length - itemsPerPage, 0)
  //         : prev - 1;
  //     } else {
  //       return (prev + 1) % events.length;
  //     }
  //   });
  // };

  const handleArrowClick = (direction: "left" | "right") => {
    setHasUserInteracted(true);

    setCurrentIndex((prev) => {
      if (direction === "left") {
        return prev === 0
          ? Math.max(events.length - itemsPerPage, 0)
          : prev - 1;
      } else {
        return (prev + 1) % events.length;
      }
    });
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

  const visibleEvents = events;

  const categoryColors: { [key: string]: string } = {
    "Food & Drink": "#FB8C00",
    Art: "#8E24AA",
    Music: "#E53935",
    "Sports & Fitness": "#43A047",
    Hobbies: "#FDD835",
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Food & Drink":
        return <RestaurantIcon fontSize="small" />;
      case "Art":
        return <BrushIcon fontSize="small" />;
      case "Music":
        return <MusicNoteIcon fontSize="small" />;
      case "Sports & Fitness":
        return <SportsHandballIcon fontSize="small" />;
      case "Hobbies":
        return <EmojiEmotionsIcon fontSize="small" />;
      default:
        return <PlaceIcon fontSize="small" />;
    }
  };

  const cardWidth = isMobile ? 260 : 300;
  const cardGap = 24;
  const containerWidth =
    cardWidth * itemsPerPage + cardGap * (itemsPerPage - 1) + 8;

  return (
    <Box sx={{ mt: 4, px: { xs: 2, sm: 3, md: 6 } }}>
      {/* filters */}
      <Stack spacing={2} direction="row" flexWrap="wrap" mb={2}>
        <FormControl
          size="small"
          sx={{
            width: 180,
            borderRadius: 9999,
            fontFamily: "'Inter', sans-serif",
            "& .MuiOutlinedInput-root": {
              fontFamily: "'Inter', sans-serif",
              borderRadius: 9999,
              backgroundColor: "#fff",
              paddingRight: "8px",
              "& fieldset": {
                border: "1px solid #ccc",
              },
              "&:hover fieldset": {
                borderColor: "#aaa",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#aaa",
              },
            },
          }}
        >
          <Select
            value={filters.category}
            onChange={(e) =>
              setFilters((fil) => ({ ...fil, category: e.target.value }))
            }
            displayEmpty
            renderValue={(selected) =>
              selected ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      color: "#fff",
                      backgroundColor: categoryColors[selected] || "#999",
                      borderRadius: "50%",
                      p: 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                    }}
                  >
                    {getCategoryIcon(selected)}
                  </Box>
                  {selected}
                </Box>
              ) : (
                <Box sx={{ color: "#777", pl: 1 }}>Category</Box>
              )
            }
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0px 8px 16px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                  overflow: "hidden",
                },
              },
            }}
            sx={{
              borderRadius: 9999,
              pl: 1,
              height: "36px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuItem value="">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PlaceIcon fontSize="small" sx={{ color: "#666" }} />
                All
              </Box>
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      color: "#fff",
                      backgroundColor: categoryColors[cat] || "#999",
                      borderRadius: "50%",
                      p: 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                    }}
                  >
                    {getCategoryIcon(cat)}
                  </Box>
                  {cat}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip
          label="Free"
          clickable
          onClick={() => toggleChip("isFree")}
          variant={filters.isFree ? "filled" : "outlined"}
          sx={{
            backgroundColor: filters.isFree ? "#42A5F5" : "#fff",
            color: filters.isFree ? "#fff" : "text.primary",
            border: filters.isFree ? "none" : "1px solid #ccc",
            fontWeight: 500,
          }}
        />

        <Chip
          label="Kid-Friendly"
          clickable
          onClick={() => toggleChip("isKidFriendly")}
          variant={filters.isKidFriendly ? "filled" : "outlined"}
          sx={{
            backgroundColor: filters.isKidFriendly ? "#42A5F5" : "#fff",
            color: filters.isKidFriendly ? "#fff" : "text.primary",
            border: filters.isKidFriendly ? "none" : "1px solid #ccc",
            fontWeight: 500,
          }}
        />

        <Chip
          label="Sober"
          clickable
          onClick={() => toggleChip("isSober")}
          variant={filters.isSober ? "filled" : "outlined"}
          sx={{
            backgroundColor: filters.isSober ? "#42A5F5" : "#fff",
            color: filters.isSober ? "#fff" : "text.primary",
            border: filters.isSober ? "none" : "1px solid #ccc",
            fontWeight: 500,
          }}
        />
      </Stack>

      {/* header */}
      <Box sx={{ position: "relative", mb: 1 }}>
        <Typography variant="h4" sx={{ textAlign: "left", mb: 1 }}>
          Upcoming Popups
        </Typography>

        <Box
          sx={{
            position: "absolute",
            right: {
              xs: "6px",
              sm: "14px",
              md: "28px",
              lg: "44px",
            },
            top: 0,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton onClick={() => handleArrowClick("left")}>
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton onClick={() => handleArrowClick("right")}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Box>

      {/* events */}
      {visibleEvents.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No upcoming popups match your filters. Try adjusting them!
          </Typography>
        </Box>
      )}

      <Box
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          overflow: "hidden",
          width: `${containerWidth}px`,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            transform: `translateX(-${currentIndex * (300 + 24)}px)`,
            transition: "transform 0.6s ease",
            py: 2,
          }}
        >
          {visibleEvents.map((event, index) => (
            <Fade key={`${event.id}-${index}`} in={true} timeout={600}>
              <Card
                sx={{
                  minWidth: { xs: 220, sm: 260, md: 280, lg: 300 },
                  maxWidth: { xs: 220, sm: 260, md: 280, lg: 300 },
                  flex: "0 0 auto",
                  boxShadow: 3,
                  display: "flex",
                  flexDirection: "column",
                  height: 470,
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  {/* image & info */}
                  <Box>
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
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                    >
                      {event.description}
                    </Typography>

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
                          <Box
                            key={cat.name}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              backgroundColor:
                                categoryColors[cat.name] || "#999",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                            }}
                            title={cat.name}
                          >
                            {getCategoryIcon(cat.name)}
                          </Box>
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
                  </Box>

                  {/* details*/}
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenModal(event)}
                      sx={{
                        borderRadius: "999px",
                        textTransform: "none",
                        fontFamily: `'DM Sans', sans-serif`,
                        boxShadow: 1,
                        backgroundColor: "#212121",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#333" },
                      }}
                    >
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Box>
      </Box>

      <EventDetails
        open={modalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        currentUserId={user?.id}
      />
    </Box>
  );
};

export default EventsFeed;
