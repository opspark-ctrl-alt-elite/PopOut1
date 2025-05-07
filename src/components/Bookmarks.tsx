import React from "react";
import { Link } from "react-router-dom";
import { Box, Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import formatDate from "../utils/formatDate";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

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
  vendor?: {
    id: string;
    businessName: string;
    averageRating?: number;
  };
  Categories?: { name: string }[];
};

interface Props {
  events: Event[];
  userId: string;
}

const Bookmarks: React.FC<Props> = ({ events }) => {
  if (!events || !Array.isArray(events) || events.length === 0) return null;

  const now = new Date();

  const upcomingEvents = events
    .filter((event) => new Date(event.endDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Food & Drink":
        return <RestaurantIcon sx={{ fontSize: 14 }} />;
      case "Art":
        return <BrushIcon sx={{ fontSize: 14 }} />;
      case "Music":
        return <MusicNoteIcon sx={{ fontSize: 14 }} />;
      case "Sports & Fitness":
        return <SportsHandballIcon sx={{ fontSize: 14 }} />;
      case "Hobbies":
        return <EmojiEmotionsIcon sx={{ fontSize: 14 }} />;
      default:
        return null;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Food & Drink":
        return { backgroundColor: "#FB8C00", color: "white" };
      case "Art":
        return { backgroundColor: "#8E24AA", color: "white" };
      case "Music":
        return { backgroundColor: "#E53935", color: "white" };
      case "Sports & Fitness":
        return { backgroundColor: "#43A047", color: "white" };
      case "Hobbies":
        return { backgroundColor: "#FDD835", color: "white" };
      default:
        return {};
    }
  };

  if (upcomingEvents.length === 0) return null;

  return (
    <Box mt={6}>
      <Typography variant="h5" gutterBottom>
        Bookmarks:
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {upcomingEvents.map((event) => (
          <Card
            key={event.id}
            sx={{
              width: 220,
              boxShadow: 2,
              borderRadius: 2,
              flex: "0 0 auto",
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
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                noWrap
                title={event.title}
              >
                {event.title}{" "}
                {event.vendor?.id && event.vendor?.businessName && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    by{" "}
                    <Link
                      to={`/vendor/${event.vendor.id}`}
                      style={{ color: "#1976d2", textDecoration: "none" }}
                    >
                      {event.vendor.businessName}
                    </Link>
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
                <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={1}>
                  {event.Categories?.map((cat) => (
                    <Box
                      key={cat.name}
                      sx={{
                        backgroundColor:
                          getCategoryStyles(cat.name).backgroundColor ||
                          "#9e9e9e",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getCategoryIcon(cat.name) &&
                        React.cloneElement(getCategoryIcon(cat.name) as React.ReactElement, {
                          sx: { color: "#fff", fontSize: 16 },
                        })}
                    </Box>
                  ))}

                  {event.isFree && (
                    <Chip
                      label="Free"
                      size="small"
                      sx={{ fontSize: "0.65rem", height: 20 }}
                    />
                  )}
                  {event.isKidFriendly && (
                    <Chip
                      label="Kid-Friendly"
                      size="small"
                      sx={{ fontSize: "0.65rem", height: 20 }}
                    />
                  )}
                  {event.isSober && (
                    <Chip
                      label="Sober"
                      size="small"
                      sx={{ fontSize: "0.65rem", height: 20 }}
                    />
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

export default Bookmarks;
