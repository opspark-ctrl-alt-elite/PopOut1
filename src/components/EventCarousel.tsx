import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Button,
  useMediaQuery,
  Fade,
  useTheme,
  Chip,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PlaceIcon from "@mui/icons-material/Place";
import formatDate from "../utils/formatDate";

const categoryColors = {
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

interface Event {
  id: string;
  title: string;
  venue_name: string;
  startDate: string;
  endDate: string;
  description: string;
  image_url?: string;
  Categories?: { name: string }[];
  isFree?: boolean;
  isKidFriendly?: boolean;
  isSober?: boolean;
}

interface EventCarouselProps {
  events: Event[];
  onDetailsClick: (event: Event) => void;
}

const EventCarousel: React.FC<EventCarouselProps> = ({ events, onDetailsClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const itemsPerPage = isMobile ? 2 : 3;
  const cardWidth = isMobile ? 260 : 300;
  const cardGap = 24;
  const containerWidth = cardWidth * itemsPerPage + cardGap * (itemsPerPage - 1) + 15;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleArrowClick = (direction: string) => {
    setCurrentIndex((prev) => {
      if (direction === "left") {
        return prev === 0 ? Math.max(events.length - itemsPerPage, 0) : prev - 1;
      } else {
        return (prev + 1) % events.length;
      }
    });
  };

  return (
    <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <IconButton onClick={() => handleArrowClick("left")}> <ArrowBackIosIcon /> </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          overflow: "hidden",
          width: `${containerWidth}px`,
          mx: 2,
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            transform: `translateX(-${currentIndex * (cardWidth + cardGap)}px)`,
            transition: "transform 0.6s ease",
            py: 2,
            pr: 1.5,
          }}
        >
          {events.map((event, index) => (
            <Fade key={`${event.id}-${index}`} in={true} timeout={600}>
              <Card
                sx={{
                  minWidth: cardWidth,
                  maxWidth: cardWidth,
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
                      {event.venue_name}
                    </Typography>
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

                    {(event.Categories?.length || event.isFree || event.isKidFriendly || event.isSober) && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                        {event.Categories?.map((cat) => (
                          <Box
                            key={cat.name}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              backgroundColor: categoryColors[cat.name as keyof typeof categoryColors] || "#999",
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
                        {event.isFree && <Chip label="Free" size="small" sx={{ fontSize: "0.75rem" }} />}
                        {event.isKidFriendly && <Chip label="Kid-Friendly" size="small" sx={{ fontSize: "0.75rem" }} />}
                        {event.isSober && <Chip label="Sober" size="small" sx={{ fontSize: "0.75rem" }} />}
                      </Stack>
                    )}
                  </Box>

                  <Box mt={2}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onDetailsClick(event)}
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

      <IconButton onClick={() => handleArrowClick("right")}> <ArrowForwardIosIcon /> </IconButton>
    </Box>
  );
};

export default EventCarousel;
