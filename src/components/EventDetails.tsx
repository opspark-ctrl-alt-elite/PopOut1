import React, { useState } from "react";
import { Link } from "react-router-dom";
import formatDate from "../utils/formatDate";

import {
  Modal,
  Box,
  Typography,
  Stack,
  Rating,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import PlaceIcon from "@mui/icons-material/Place";

type Event = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  location: string;
  description: string;
  isFree: boolean;
  isKidFriendly: boolean;
  isSober: boolean;
  vendor: {
    id: any;
    businessName: string;
    averageRating?: number;
  };
  Categories?: { name: string }[];
};

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
}

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  minWidth: 300,
  maxWidth: 500,
};

const EventDetails: React.FC<Props> = ({ open, onClose, event }) => {
  const [bookmarked, setBookmarked] = useState(false);

  if (!event) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1 }}>
              {event.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              by{" "}
              <Link
                to={`/vendor/${event.vendor.id}`}
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                {event.vendor.businessName}
              </Link>
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {formatDate(event.startDate, event.endDate)}
        </Typography>

        {event.description && (
          <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
            {event.description}
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <PlaceIcon fontSize="small" />
          <Typography variant="body2" fontWeight="bold">
            {event.venue_name}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ml: 4, mt: 0.25 }}
        >
          {event.location.replace(/,\s*USA$/, "")}
        </Typography>

        {(event.Categories?.length ||
          event.isFree ||
          event.isKidFriendly ||
          event.isSober) && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
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
              <Chip label="Free" size="small" sx={{ fontSize: "0.75rem" }} />
            )}
            {event.isKidFriendly && (
              <Chip
                label="Kid-Friendly"
                size="small"
                sx={{ fontSize: "0.75rem" }}
              />
            )}
            {event.isSober && (
              <Chip label="Sober" size="small" sx={{ fontSize: "0.75rem" }} />
            )}
          </Stack>
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 2 }}
        >
          <Box>
            <Typography variant="body2">
              <strong>Average Rating:</strong>
            </Typography>
            <Rating
              value={event.vendor.averageRating || 0}
              precision={0.5}
              readOnly
              sx={{ mt: 0.5 }}
            />
          </Box>
          <Tooltip
            title={bookmarked ? "Remove from bookmarks" : "Bookmark this event"}
          >
            <IconButton
              onClick={() => setBookmarked((prev) => !prev)}
              aria-label={bookmarked ? "Unbookmark" : "Bookmark"}
              sx={{ ml: 2 }}
            >
              {bookmarked ? (
                <BookmarkIcon color="primary" />
              ) : (
                <BookmarkBorderIcon />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Modal>
  );
};

export default EventDetails;
