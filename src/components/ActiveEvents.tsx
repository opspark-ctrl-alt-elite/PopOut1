import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import ErrorIcon from "@mui/icons-material/Error";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PlaceIcon from "@mui/icons-material/Place";
import formatDate from "../utils/formatDate";

/* ─────────────── Types ─────────────── */
type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  image_url?: string;
  Categories?: { name: string }[];
  isFree?: boolean;
  isKidFriendly?: boolean;
  isSober?: boolean;
};

/* ────────── StyledButton (for dialog actions) ────────── */
const StyledButton = styled(Button)({
  borderRadius: 12,
  textTransform: "none",
  padding: "8px 16px",
  fontWeight: 600,
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
});

/* ────────── Category helpers ────────── */
const categoryColors: Record<string, string> = {
  "Food & Drink": "#FB8C00",
  Art: "#8E24AA",
  Music: "#E53935",
  "Sports & Fitness": "#43A047",
  Hobbies: "#FDD835",
};

const getCategoryIcon = (c: string) => {
  switch (c) {
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

/* ────────── Component ────────── */
const ActiveEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  /* confirm‑delete dialog */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetEvent, setTargetEvent] = useState<Event | null>(null);

  const upcomingScrollRef = useRef<HTMLDivElement>(null);
  const pastScrollRef = useRef<HTMLDivElement>(null);

  /* ── data fetch ── */
  useEffect(() => {
    fetchUser();
    fetchEvents();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/me", { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/api/events/my-events");
      const all: Event[] = res.data;
      const now = new Date();
      setEvents(all.filter((e) => new Date(e.endDate) >= now));
      setPastEvents(all.filter((e) => new Date(e.endDate) < now));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      // delete all uploaded images associated with event
      await axios.delete(`/api/images/eventId/${id}`, { withCredentials: true });
      await axios.delete(`/api/events/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  /* confirm‑dialog helpers */
  const openConfirm = (evt: Event) => {
    setTargetEvent(evt);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setTargetEvent(null);
  };
  const handleConfirmDelete = async () => {
    if (targetEvent) await deleteEvent(targetEvent.id);
    closeConfirm();
  };

  /* scroll helper */
  const scroll = (
    dir: "left" | "right",
    ref: React.RefObject<HTMLDivElement>
  ) => {
    ref.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  /* card renderer */
  const CARD_W = 300;
  const CARD_H = 470;

  const renderEventCard = (e: Event) => (
    <Card
      key={e.id}
      sx={{
        minWidth: CARD_W,
        maxWidth: CARD_W,
        height: CARD_H,
        flex: "0 0 auto",
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        position: 'relative',
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          pb: 8,
        }}
      >
        {/* main content */}
        <Box>
          {e.image_url && (
            <Box mb={2}>
              <img
                src={e.image_url}
                alt={e.title}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            </Box>
          )}

          <Typography variant="h6" gutterBottom>
            {e.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {e.venue_name}
          </Typography>

          <Typography variant="body2">
            {formatDate(e.startDate, e.endDate)}
          </Typography>

          {e.description && (
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
              {e.description}
            </Typography>
          )}

          {(e.Categories?.length ||
            e.isFree ||
            e.isKidFriendly ||
            e.isSober) && (
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              {e.Categories?.map((cat) => (
                <Box
                  key={cat.name}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor:
                      categoryColors[cat.name as keyof typeof categoryColors] ||
                      "#999",
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
              {e.isFree && (
                <Chip label="Free" size="small" sx={{ fontSize: "0.75rem" }} />
              )}
              {e.isKidFriendly && (
                <Chip
                  label="Kid-Friendly"
                  size="small"
                  sx={{ fontSize: "0.75rem" }}
                />
              )}
              {e.isSober && (
                <Chip label="Sober" size="small" sx={{ fontSize: "0.75rem" }} />
              )}
            </Stack>
          )}
        </Box>
      </CardContent>

      {/* Fixed action bar at bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          borderBottomLeftRadius: 'inherit',
          borderBottomRightRadius: 'inherit',
        }}
      >
        <Tooltip title="Edit" arrow>
          <IconButton
            component={Link}
            to={`/edit-event/${e.id}`}
            sx={{
              backgroundColor: "#1b74e4",
              color: "#fff",
              "&:hover": { backgroundColor: "#1a6ed8" },
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete" arrow>
          <IconButton
            sx={{
              backgroundColor: "#b71c1c",
              color: "#fff",
              "&:hover": { backgroundColor: "#fbe9e7", color: "#b71c1c" },
            }}
            onClick={() => openConfirm(e)}
          >
            <DeleteForeverIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );

  /* scrollable wrapper */
  const renderScrollable = (
    list: Event[],
    ref: React.RefObject<HTMLDivElement>,
    label: string
  ) => (
    <Box sx={{ position: "relative", mt: 2 }}>
      {/* arrows */}
      <IconButton
        onClick={() => scroll("left", ref)}
        sx={{
          position: "absolute",
          top: "40%",
          left: 0,
          zIndex: 2,
          bgcolor: "#fff",
          border: "1px solid #ddd",
          "&:hover": { bgcolor: "#f0f0f0" },
        }}
      >
        <ArrowBackIosIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={() => scroll("right", ref)}
        sx={{
          position: "absolute",
          top: "40%",
          right: 0,
          zIndex: 2,
          bgcolor: "#fff",
          border: "1px solid #ddd",
          "&:hover": { bgcolor: "#f0f0f0" },
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>

      <Box
        ref={ref}
        sx={{
          display: "flex",
          gap: 3,
          py: 2,
          px: 6,
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {list.length ? (
          list.map(renderEventCard)
        ) : (
          <Box
            sx={{
              flex: "0 0 100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 120,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.7rem",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              No&nbsp;{label}&nbsp;Popups
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  /* ── render ── */
  return (
    <Box>
      {/* profile header */}
      {user && (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={user.profile_picture}
                alt={user.name}
                sx={{ width: 85, height: 85 }}
              />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton href="#" sx={{ color: "#1877F2" }}>
                <FacebookIcon />
              </IconButton>
              <IconButton href="#" sx={{ color: "#C13584" }}>
                <InstagramIcon />
              </IconButton>
              <IconButton href="#" sx={{ color: "#34A853" }}>
                <LanguageIcon />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                component={Link}
                to="/vendorprofile"
              >
                Back to Vendor Profile
              </Button>
            </Stack>
          </Stack>
        </Container>
      )}

      <Divider sx={{ my: 4 }} />

      {/* tabs + events */}
      <Container maxWidth="lg">
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{
            mb: 2,
            "& .MuiTab-root": {
              fontSize: "1.7rem",
              fontFamily: "'Bebas Neue', sans-serif",
              textTransform: "none",
              minWidth: "auto",
              mr: 4,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#42a5f5",
              height: 3,
            },
          }}
        >
          <Tab label="Upcoming Popups" />
          <Tab label="Past Popups" />
        </Tabs>

        {loading ? (
          <CircularProgress />
        ) : tabIndex === 0 ? (
          renderScrollable(events, upcomingScrollRef, "Upcoming")
        ) : (
          renderScrollable(pastEvents, pastScrollRef, "Past")
        )}
      </Container>

      {/* delete confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onClose={closeConfirm}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: "error.main",
          }}
        >
          <ErrorIcon color="error" fontSize="large" />
          Delete Popup?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{targetEvent?.title}</strong>? This action can't be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 2 }}>
          <StyledButton
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#b71c1c",
              color: "#fff",
              "&:hover": { backgroundColor: "#fbe9e7", color: "#b71c1c" },
            }}
            onClick={handleConfirmDelete}
          >
            Delete
          </StyledButton>
          <StyledButton fullWidth variant="outlined" onClick={closeConfirm}>
            Cancel
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActiveEvents;