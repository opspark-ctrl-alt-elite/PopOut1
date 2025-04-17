import React, { useState, useEffect } from "react";
import { Link, useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Container,
  Button,
  Divider,
  Card,
  CardContent,
} from "@mui/material";

type Category = {
  id: number;
  name: string;
};

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue_name: string;
};

type FollowedVendor = {
  id: string;
  businessName: string;
  profilePicture?: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  categories?: Category[];
  is_vendor: boolean;
};

type Props = {
  user: User | null;
};

const UserProfile: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Event[]>([]);
  const [followedVendors, setFollowedVendors] = useState<FollowedVendor[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchFollowedVendors = async () => {
      try {
        const res = await axios.get(`/users/${user.id}/followed-vendors`);
        const vendorsWithImages = await Promise.all(
          res.data.map(async (vendor: FollowedVendor) => {
            try {
              const imageRes = await axios.get(`/api/images/vendorId/${vendor.id}`);
              const uploadedImage = imageRes.data?.[0]?.referenceURL || vendor.profilePicture || "";
              return {
                ...vendor,
                profilePicture: uploadedImage,
              };
            } catch {
              return vendor;
            }
          })
        );
        setFollowedVendors(vendorsWithImages);
      } catch (err) {
        console.error("Error fetching followed vendors", err);
      }
    };

    fetchFollowedVendors();
  }, [user]);

  const handleDeleteUser = () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    fetch(`/user/me`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        navigate("/");
      })
      .catch((err) => {
        console.error("Error deleting user:", err);
        alert("Failed to delete account.");
      });
  };

  const handleViewBookmarkedEvents = () => {
    if (!user) return;

    axios
      .get(`/users/${user.id}/bookmarked-events`)
      .then((res) => setBookmarkedEvents(res.data))
      .catch((err) => {
        console.error("Error fetching bookmarked events:", err);
      });
  };

  const handleUnbookmarkEvent = (eventId: string) => {
    if (!user) return;

    axios
      .delete(`/users/${user.id}/unbookmark/${eventId}`)
      .then(() => {
        setBookmarkedEvents((prev) =>
          prev.filter((event) => event.id !== eventId)
        );
      })
      .catch((err) => {
        console.error("Failed to unbookmark event", err);
      });
  };

  return (
    <Box>
      <Container maxWidth="md" sx={{ mt: 6 }}>
        {user ? (
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={4}
              sx={{ mb: 4 }}
              flexWrap="wrap"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={user.profile_picture}
                  alt={user.name}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="outlined"
                size="small"
                component={Link}
                to="/edit-profile"
              >
                Edit Profile
              </Button>
            </Stack>

            {/* prefs */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Preferences:
            </Typography>

            {user.categories && user.categories.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={4}>
                {user.categories.map((cat) => (
                  <Box
                    key={cat.id}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: "8px",
                      backgroundColor: "#e0e0e0",
                      fontWeight: "bold",
                    }}
                  >
                    {cat.name}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography>No preferences selected yet.</Typography>
            )}

            {/* Buttons */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleViewBookmarkedEvents}
              >
                Bookmarked / Upcoming Events
              </Button>

              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/preferences"
              >
                User Preferences
              </Button>

              <Divider />

              {user.is_vendor ? (
                <Button
                  component={Link}
                  to="/vendorprofile"
                  variant="text"
                  fullWidth
                >
                  View Vendor Profile
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/vendor-signup"
                  variant="outlined"
                  fullWidth
                >
                  Become a Vendor
                </Button>
              )}

              <Divider />

              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleDeleteUser}
              >
                Delete My Account
              </Button>
            </Stack>

            {/* Bookmarked Events */}
            {bookmarkedEvents.length > 0 && (
              <Box mt={6}>
                <Typography variant="h6" gutterBottom>
                  Your Bookmarked Events:
                </Typography>
                <Stack spacing={2}>
                  {bookmarkedEvents.map((event) => (
                    <Card key={event.id}>
                      <CardContent>
                        <Typography variant="h6">{event.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.venue_name}
                        </Typography>
                        <Typography variant="body2">
                          {new Date(event.startDate).toLocaleString()} -{" "}
                          {new Date(event.endDate).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {event.description}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleUnbookmarkEvent(event.id)}
                        >
                          Remove Bookmark
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            {/* followed vendors */}
            {followedVendors.length > 0 && (
              <Box mt={6}>
                <Typography variant="h6" gutterBottom>
                  Vendors You Follow:
                </Typography>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))"
                  gap={2}
                >
                  {followedVendors.map((vendor) => (
                    <RouterLink
                      key={vendor.id}
                      to={`/vendor/${vendor.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Card
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          padding: 2,
                          borderRadius: 3,
                          boxShadow: 2,
                          cursor: "pointer",
                          transition: "transform 0.2s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: 4,
                          },
                        }}
                      >
                        <Avatar
                          src={vendor.profilePicture || "/default-avatar.png"}
                          alt={vendor.businessName}
                          sx={{ width: 48, height: 48 }}
                        />
                        <Box>
                          <Typography
                            fontWeight="bold"
                            variant="body1"
                            color="text.primary"
                          >
                            {vendor.businessName}
                          </Typography>
                        </Box>
                      </Card>
                    </RouterLink>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Typography textAlign="center" mt={4}>
            No user found.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default UserProfile;
