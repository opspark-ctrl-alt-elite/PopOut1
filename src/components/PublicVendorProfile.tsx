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
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import Navbar from "./NavBar";
import formatDate from "../utils/formatDate";
import ReviewComponent from "./Review";

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
  Categories?: { name: string }[];
};

type Vendor = {
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
  user?: {
    name: string;
    profile_picture?: string;
  };
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
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const scrollAmount = 320;
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/vendors/${vendorId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const res = await axios.get(`/vendors/${vendorId}/average-rating`);
      const avg = parseFloat(res.data.averageRating) || 0;
      const count = parseInt(res.data.reviewCount, 10) || 0;
      setAvgRating(avg);
      setReviewCount(count);
      await fetchReviews();
    } catch (err) {
      console.error("Error fetching average rating:", err);
      setAvgRating(0);
      setReviewCount(0);
    }
  };

  const handleReviewAction = () => {
    fetchAverageRating();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!vendorId) return;
      
      try {
        setLoading(true);
        const [eventsRes, vendorRes, imageRes] = await Promise.all([
          axios.get(`/api/events/vendor/${vendorId}`),
          axios.get(`/api/vendor/public/${vendorId}`),
          axios.get(`/api/images/vendorId/${vendorId}`),
        ]);

        const sortedEvents = eventsRes.data.sort((a: Event, b: Event) => {
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
        setEvents(sortedEvents);
        setVendor(vendorRes.data);

        if (imageRes.data?.length > 0) {
          setUploadedImage(imageRes.data[0].referenceURL);
        }

        if (user) {
          try {
            const followRes = await axios.get(`/users/${user.id}/follows/${vendorId}`);
            setIsFollowing(followRes.data.isFollowing);
          } catch (err) {
            console.error("Error checking follow status", err);
            setIsFollowing(false);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setEvents([]);
        setVendor(null);
        setUploadedImage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchAverageRating();
  }, [vendorId, user]);

  const handleFollowToggle = () => {
    if (!user) return;
    const route = isFollowing
      ? `/users/${user.id}/unfollow/${vendorId}`
      : `/users/${user.id}/follow/${vendorId}`;
    axios
      .post(route)
      .then(() => {
        setIsFollowing(!isFollowing);
      })
      .catch((err) => console.error("Error toggling follow", err));
  };

  const now = new Date();
  const filteredEvents =
    tabIndex === 0
      ? events.filter((e) => new Date(e.endDate) >= now)
      : events.filter((e) => new Date(e.endDate) < now);

  return (
    <>
      <Navbar user={user} />
      <Box sx={{ p: 4 }}>
        {vendor && (
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={uploadedImage || vendor.profilePicture || ""}
                alt={vendor.businessName}
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
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              {vendor.facebook && (
                <IconButton component="a" href={vendor.facebook} target="_blank">
                  <FacebookIcon color="primary" />
                </IconButton>
              )}
              {vendor.instagram && (
                <IconButton component="a" href={vendor.instagram} target="_blank">
                  <InstagramIcon sx={{ color: "#d62976" }} />
                </IconButton>
              )}
              {vendor.website && (
                <IconButton component="a" href={vendor.website} target="_blank">
                  <LanguageIcon sx={{ color: "#4caf50" }} />
                </IconButton>
              )}
              {user && (
                <Button variant="outlined" onClick={handleFollowToggle}>
                  {isFollowing ? "Unfollow" : "Follow"} Vendor
                </Button>
              )}
            </Stack>
          </Stack>
        )}

        {vendor?.description && (
          <Typography variant="body1" sx={{ mb: 3 }}>
            {vendor.description}
          </Typography>
        )}

        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Upcoming Popups" />
          <Tab label="Past Popups" />
        </Tabs>

        {loading ? (
          <CircularProgress />
        ) : filteredEvents.length === 0 ? (
          <Typography>No {tabIndex === 0 ? "Upcoming" : "Past"} Popups</Typography>
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
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <ArrowBackIosIcon />
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
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <ArrowForwardIosIcon />
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
                "&::-webkit-scrollbar": { display: "none" },
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
                  <CardContent>
                    <Typography variant="h6">{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.venue_name}
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(event.startDate, event.endDate)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {event.description}
                    </Typography>
                    {event.Categories && event.Categories.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1, flexWrap: "wrap" }}
                      >
                        {event.Categories.map((cat) => (
                          <Chip
                            key={cat.name}
                            label={cat.name}
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        ))}
                      </Stack>
                    )}
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
            <Box sx={{ mb: 4 }}>
              <List sx={{ 
                maxHeight: 300, 
                overflow: 'auto',
                border: '1px solid #eee',
                borderRadius: 1,
                p: 1
              }}>
                {reviews.map((review) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar 
                          src={review.user?.profile_picture} 
                          alt={review.user?.name || 'Anonymous'}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={review.user?.name || 'Anonymous'}
                        secondary={
                          <>
                            <Rating 
                              value={review.rating} 
                              precision={0.5} 
                              readOnly 
                              size="small"
                            />
                            {review.comment && (
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                display="block"
                              >
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
            </Box>
          )}

          {vendorId && (
            <>
              {user ? (
                <ReviewComponent
                  vendorId={vendorId}
                  currentUserId={user.id}
                  onReviewAdded={handleReviewAction}
                  onReviewUpdated={handleReviewAction}
                  onReviewDeleted={handleReviewAction}
                />
              ) : (
                <Typography variant="body1">
                  Please sign in to add your review.
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default PublicVendorProfile;