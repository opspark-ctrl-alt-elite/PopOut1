// PublicVendorProfile.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Button,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Rating,
  Alert,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Language,
  ArrowBackIos,
  ArrowForwardIos,
  PersonAddAlt,
  PersonRemove,
} from "@mui/icons-material";
import formatDate from "../utils/formatDate";
import ReviewComponent from "./Review";
import EventDetails from "./EventDetails";

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  } | null;
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
  vendor: {
    id: string;
    businessName: string;
    averageRating?: number;
  };
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

const PublicVendorProfile: React.FC<Props> = ({ user }) => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  const scroll = (dir: "left" | "right") => {
    const amount = 320;
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleOpenModal = (e: Event) => {
    setSelectedEvent(e);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

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

      const events = (eRes.data as Event[])
        .map((e) => ({ ...e, vendor: v }))
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() -
            new Date(b.startDate).getTime()
        );
      setEvents(events);

      if (imgRes.data?.length) {
        setUploadedImage(imgRes.data[0].referenceURL);
      }

      setAvgRating(parseFloat(rRes.data.averageRating) || 0);
      setReviewCount(parseInt(rRes.data.reviewCount, 10) || 0);

      const revs = (await axios.get(`/api/vendor/${vendorId}/reviews`))
        .data as Review[];
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

  const filteredEvents =
    tabIndex === 0
      ? events.filter((e) => new Date(e.endDate) >= now)
      : events.filter((e) => new Date(e.endDate) < now);

  return (
    <Box sx={{ p: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {vendor && (
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={uploadedImage || vendor.profilePicture}
              sx={{ width: 70, height: 70 }}
            />
            <Box>
              <Typography variant="h6" fontWeight="bold">
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
                  ({reviewCount}{" "}
                  {reviewCount === 1 ? "review" : "reviews"})
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
                startIcon={
                  isFollowing ? <PersonRemove /> : <PersonAddAlt />
                }
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
      )}

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={{ mb: 2 }}
      >
        <Tab label="Upcoming Popups" />
        <Tab label="Past Popups" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : filteredEvents.length === 0 ? (
        <Typography>
          No {tabIndex === 0 ? "Upcoming" : "Past"} Popups
        </Typography>
      ) : (
        <Box sx={{ position: "relative", mt: 2 }}>
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              position: "absolute",
              top: "35%",
              left: 0,
              zIndex: 2,
              bgcolor: "#fff",
              boxShadow: 2,
            }}
          >
            <ArrowBackIos />
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
            }}
          >
            <ArrowForwardIos />
          </IconButton>
          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              gap: 3,
              py: 2,
              px: 5,
              overflowX: "scroll",
              scrollbarWidth: "none",
            }}
          >
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                sx={{
                  minWidth: 300,
                  maxWidth: 300,
                  flex: "0 0 auto",
                  boxShadow: 3,
                }}
              >
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                    }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{event.title}</Typography>
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
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      maxHeight: 60,
                      overflow: "hidden",
                    }}
                  >
                    {event.Categories?.map((cat) => (
                      <Chip
                        key={cat.name}
                        label={cat.name}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                    {event.isFree && <Chip label="Free" size="small" />}
                    {event.isKidFriendly && (
                      <Chip label="Kid-Friendly" size="small" />
                    )}
                    {event.isSober && <Chip label="Sober" size="small" />}
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenModal(event)}
                    sx={{
                      mt: 2,
                      backgroundColor: "#000",
                      "&:hover": { backgroundColor: "#333" },
                    }}
                  >
                    Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

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
            {reviews.map((review) => (
              <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar src={review.user?.profile_picture} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={review.user?.name || "Anonymous"}
                    secondary={
                      <>
                        <Rating
                          value={review.rating}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        {review.comment && (
                          <Typography variant="body2">
                            {review.comment}
                          </Typography>
                        )}
                        <Typography variant="caption">
                          {new Date(review.createdAt).toLocaleDateString()}
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

      <EventDetails
        open={modalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        currentUserId={user?.id || ""}
      />
    </Box>
  );
};

export default PublicVendorProfile;