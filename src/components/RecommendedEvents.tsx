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

import formatDate from "../utils/formatDate";

// TYPES
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

interface Props {
  events: Event[];
}

const RecommendedEvents: React.FC<Props> = ({ events }) => {
  if (!events || !Array.isArray(events) || events.length === 0) return null;

  return (
    <Box mt={6}>
      <Typography variant="h5" gutterBottom>
        Recommended Popups:
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {events.map((event) => (
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
                <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={1}>
                  {event.Categories?.map((cat) => (
                    <Chip
                      key={cat.name}
                      label={cat.name}
                      size="small"
                      sx={{ fontSize: "0.65rem", height: 20 }}
                    />
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

export default RecommendedEvents;
