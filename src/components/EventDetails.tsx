import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
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
    id: string;
    businessName: string;
    averageRating?: number;
  };
  Categories?: { name: string }[];
  latitude: number;
  longitude: number;
};

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  currentUserId: string;
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

const EventDetails: React.FC<Props> = ({
  open,
  onClose,
  event,
  currentUserId,
}) => {
  const [bookmarked, setBookmarked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!event || !currentUserId) return;

    axios
      .get(`/users/${currentUserId}/bookmarked-events`)
      .then((res) => {
        const alreadyBookmarked = res.data.some(
          (e: Event) => e.id === event.id
        );
        setBookmarked(alreadyBookmarked);
      })
      .catch((err) => console.error("bookmark fail", err));
  }, [event, currentUserId]);

  const handleToggleBookmark = async () => {
    if (!event || !currentUserId) {
      console.warn("no event/id");
      return;
    }

    try {
      if (bookmarked) {
        await axios.delete(`/users/${currentUserId}/unbookmark/${event.id}`);
        setBookmarked(false);
        console.log("bookmark removed");
      } else {
        await axios.post(`/${currentUserId}/bookmark/${event.id}`);
        setBookmarked(true);
        console.log("event bookmarked");
      }
    } catch (err) {
      console.error("bookmark err", err);
    }
  };

  if (!event) return null;

  const handleViewOnMap = () => {
    navigate(`/map?lat=${event.latitude}&lng=${event.longitude}`);
  };

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
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.75rem",
              color: "#1976d2",
              cursor: "pointer",
              ml: 1,
            }}
            onClick={handleViewOnMap}
          >
            View on Map
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
            title={bookmarked ? "Remove bookmark" : "Bookmark this PopUp"}
          >
            <IconButton
              onClick={handleToggleBookmark}
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
