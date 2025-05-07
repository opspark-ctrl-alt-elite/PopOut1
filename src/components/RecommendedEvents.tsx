import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PlaceIcon from "@mui/icons-material/Place";

import formatDate from "../utils/formatDate";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  image_url?: string;
  isFree: boolean;
  isKidFriendly?: boolean;
  isSober?: boolean;
  vendor?: {
    id: string;
    businessName: string;
  };
  Categories?: { name: string }[];
}

interface Preference {
  name: string;
}

interface Props {
  events: Event[];
  preferences: Preference[];
}

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

const categoryColors: { [key: string]: string } = {
  "Food & Drink": "#FB8C00",
  Art: "#8E24AA",
  Music: "#E53935",
  "Sports & Fitness": "#43A047",
  Hobbies: "#FDD835",
};

const RecommendedEvents: React.FC<Props> = ({ events, preferences }) => {
  if (!events || events.length === 0 || !preferences || preferences.length === 0) return null;

  const now = new Date();
  const preferredNames = preferences.map((p) => p.name.toLowerCase());

  const upcomingEvents = events.filter(
    (event) =>
      new Date(event.endDate) >= now &&
      event.vendor?.id &&
      event.Categories?.some((cat) =>
        preferredNames.includes(cat.name.toLowerCase())
      )
  );

  if (upcomingEvents.length === 0) return null;

  return (
    <Box mt={6}>
      <Typography variant="h5" gutterBottom>
        Recommended Popups:
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {upcomingEvents.map((event) => (
          <Card
            key={event.id}
            sx={{
              width: 220,
              boxShadow: 2,
              borderRadius: 2,
              flex: "0 0 auto",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: 4,
              },
            }}
          >
            {event.image_url && (
              <Box>
                <img
                  src={event.image_url}
                  alt={event.title}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                />
              </Box>
            )}

            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap title={event.title}>
                {event.title}{" "}
                {event.vendor && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    by{" "}
                    <RouterLink
                      to={`/vendor/${event.vendor.id}`}
                      style={{ color: "#1976d2", textDecoration: "none" }}
                    >
                      {event.vendor.businessName}
                    </RouterLink>
                  </Typography>
                )}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {formatDate(event.startDate, event.endDate)}
              </Typography>

              <Typography variant="caption" display="block">
                {event.venue_name}
              </Typography>

              {(event.Categories?.length ||
                event.isFree ||
                event.isKidFriendly ||
                event.isSober) && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={1} alignItems="center">
                  {event.Categories?.map((cat) => (
                    <Box
                      key={cat.name}
                      sx={{
                        backgroundColor: categoryColors[cat.name] || "#9e9e9e",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {React.cloneElement(getCategoryIcon(cat.name), {
                        sx: { color: "#fff", fontSize: 16 },
                      })}
                    </Box>
                  ))}
                  {event.isFree && (
                    <Chip label="Free" size="small" sx={{ fontSize: "0.65rem", height: 20 }} />
                  )}
                  {event.isKidFriendly && (
                    <Chip label="Kid-Friendly" size="small" sx={{ fontSize: "0.65rem", height: 20 }} />
                  )}
                  {event.isSober && (
                    <Chip label="Sober" size="small" sx={{ fontSize: "0.65rem", height: 20 }} />
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default RecommendedEvents;
