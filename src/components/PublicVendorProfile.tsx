import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Language,
  PersonAddAlt,
  PersonRemove,
} from "@mui/icons-material";
import ReviewComponent from "./Review";
import EventDetails from "./EventDetails";
import EventCarousel from "./EventCarousel";

/* ────────────────────────── Types ────────────────────────── */

type Props = {
  user: { id: string; name: string; email: string; profile_picture?: string } | null;
};

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  location: string;
  image_url?: string;
  isFree: boolean;
  isKidFriendly: boolean;
  isSober: boolean;
  Categories?: { name: string }[];
  vendor: { id: string; businessName: string; averageRating?: number };
};

type Vendor = {
  id?: string;
  businessName: string;
  description: string;
  profilePicture?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  email?: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  user?: { name: string; profile_picture?: string };
  createdAt: string;
};

/* ────────────────────────── Component ────────────────────────── */

const PublicVendorProfile: React.FC<Props> = ({ user }) => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const now = new Date();

  /* ────────────────────────── Data Fetch ────────────────────────── */

  const fetchData = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const [vRes, imgRes, eRes, rRes] = await Promise.all([
        axios.get(`/api/vendor/public/${vendorId}`),
        axios.get(`/api/images/vendorId/${vendorId}`),
        axios.get(`/api/events/vendor/${vendorId}`),
        axios.get(`/api/vendor/${vendorId}/average-rating`),
      ]);

      const v: Vendor = { ...vRes.data, id: vendorId };
      setVendor(v);

      const evts: Event[] = (eRes.data as Event[])
        .map((e) => ({ ...e, vendor: v }))
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      setEvents(evts);

      if (imgRes.data?.length) {
        setUploadedImage(imgRes.data[0].referenceURL);
      }

      setAvgRating(parseFloat(rRes.data.averageRating) || 0);
      setReviewCount(parseInt(rRes.data.reviewCount, 10) || 0);

      const revs = (
        await axios.get(`/api/vendor/${vendorId}/reviews`)
      ).data as Review[];
      setReviews(
        revs.map((r) => ({ ...r, user: r.user || { name: "Anonymous" } }))
      );
    } catch {
      setError("Failed to load vendor data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return;
    const route = isFollowing
      ? `/api/users/${user.id}/unfollow/${vendorId}`
      : `/api/users/${user.id}/follow/${vendorId}`;
    await axios.post(route);
    setIsFollowing((f) => !f);
  };

  useEffect(() => {
    fetchData();
    if (user) {
      axios
        .get(`/api/users/${user.id}/follows/${vendorId}`)
        .then((r) => setIsFollowing(r.data.isFollowing))
        .catch(() => setIsFollowing(false));
    }
  }, [vendorId, user]);

  /* ────────────────────────── Derived Data ────────────────────────── */

  const filteredEvents =
    tabIndex === 0
      ? events.filter((e) => new Date(e.endDate) >= now)
      : events.filter((e) => new Date(e.endDate) < now);

  /* ────────────────────────── Render ────────────────────────── */

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {vendor && (
        <>
          {/* Header */}
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={uploadedImage || vendor.profilePicture}
                sx={{ width: 85, height: 85 }}
              />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {vendor.businessName}
                </Typography>
                {vendor.email && (
                  <Typography variant="body2" color="text.secondary">
                    {vendor.email}
                  </Typography>
                )}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Rating value={avgRating} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              {vendor.facebook && (
                <IconButton href={vendor.facebook} target="_blank">
                  <Facebook color="primary" />
                </IconButton>
              )}
              {vendor.instagram && (
                <IconButton href={vendor.instagram} target="_blank">
                  <Instagram sx={{ color: "#d62976" }} />
                </IconButton>
              )}
              {vendor.website && (
                <IconButton href={vendor.website} target="_blank">
                  <Language sx={{ color: "#4caf50" }} />
                </IconButton>
              )}
              {user && (
                <Button
                  variant="contained"
                  startIcon={isFollowing ? <PersonRemove /> : <PersonAddAlt />}
                  onClick={handleFollowToggle}
                  sx={{
                    backgroundColor: isFollowing ? "#e4e6eb" : "#1b74e4",
                    color: isFollowing ? "#050505" : "#fff",
                    "&:hover": {
                      backgroundColor: isFollowing ? "#d8dadf" : "#1a6ed8",
                    },
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Description */}
          {vendor.description && (
            <Typography
              variant="body1"
              sx={{ mt: 1, color: "#000", maxWidth: 720, fontSize: "0.95rem" }}
            >
              {vendor.description}
            </Typography>
          )}
        </>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Tabs */}
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

      {/* Events / No‑events message */}
      {loading ? (
        <CircularProgress />
      ) : filteredEvents.length === 0 ? (
        <Box
          sx={{
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
            No&nbsp;{tabIndex === 0 ? "Upcoming" : "Past"}&nbsp;Popups
          </Typography>
        </Box>
      ) : (
        <EventCarousel
          events={filteredEvents}
          onDetailsClick={(e) => {
            setSelectedEvent(e);
            setModalOpen(true);
          }}
        />
      )}

      {/* Reviews */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reviews ({reviewCount})
        </Typography>

        {reviewCount > 0 && (
          <List
            sx={{
              maxHeight: 300,
              overflow: "auto",
              border: "1px solid #eee",
              borderRadius: 1,
              p: 1,
            }}
          >
            {reviews.map((r) => (
              <React.Fragment key={r.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar src={r.user?.profile_picture} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={r.user?.name || "Anonymous"}
                    secondary={
                      <>
                        <Rating
                          value={r.rating}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        {r.comment && (
                          <Typography variant="body2">{r.comment}</Typography>
                        )}
                        <Typography variant="caption">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Add review */}
        {vendorId && (
          <>
            {user ? (
              <ReviewComponent
                vendorId={vendorId}
                currentUserId={user.id}
                onReviewAdded={fetchData}
                onReviewUpdated={fetchData}
                onReviewDeleted={fetchData}
              />
            ) : (
              <Typography>Please sign in to add your review.</Typography>
            )}
          </>
        )}
      </Box>

      {/* Event modal */}
      <EventDetails
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        currentUserId={user?.id || ""}
      />
    </Container>
  );
};

export default PublicVendorProfile;
