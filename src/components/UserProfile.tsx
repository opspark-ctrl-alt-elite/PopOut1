import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Bookmarks from "../components/Bookmarks";
import EditProfile from "../components/EditProfile";
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
  Modal,
} from "@mui/material";

// ICONS
import RestaurantIcon from "@mui/icons-material/Restaurant";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PlaceIcon from "@mui/icons-material/Place";

// ICONS AND COLORS (same as EditProfile)
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

type Category = { id: number; name: string };
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
type Preference = { userId: string; categoryId: number };
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
  setUser: (user: User) => void;
  categories: Category[] | null;
};

const UserProfile: React.FC<Props> = ({ user, setUser, categories }) => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Event[]>([]);
  const [preferences, setPreferences] = useState<Category[]>([]);
  const [followedVendors, setFollowedVendors] = useState<FollowedVendor[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user && categories) getPreferences();
  }, [user, categories]);

  const getPreferences = async () => {
    if (!user || !categories) return;
    try {
      const res = await axios.get(`/api/preferences/${user.id}`);
      const prefCats: Category[] = res.data
        .map((pref: Preference) => categories.find((cat) => cat.id === pref.categoryId))
        .filter((c): c is Category => !!c);
      setPreferences(prefCats);
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchFollowedVendors = async () => {
      try {
        const res = await axios.get(`/users/${user.id}/followed-vendors`);
        const withImages = await Promise.all(
          res.data.map(async (vendor: FollowedVendor) => {
            try {
              const imgRes = await axios.get(`/api/images/vendorId/${vendor.id}`);
              return {
                ...vendor,
                profilePicture: imgRes.data?.[0]?.referenceURL || vendor.profilePicture,
              };
            } catch {
              return vendor;
            }
          })
        );
        setFollowedVendors(withImages);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    };

    const fetchBookmarkedEvents = async () => {
      try {
        const res = await axios.get(`/users/${user.id}/bookmarked-events`);
        setBookmarkedEvents(res.data);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      }
    };

    fetchFollowedVendors();
    fetchBookmarkedEvents();
  }, [user]);

  const handleDeleteUser = async () => {
    if (!user) return;
    try {
      await fetch(`/user/me`, { method: "DELETE", credentials: "include" });
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <Box>
      <Container maxWidth="md" sx={{ mt: 6 }}>
        {user ? (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
              <Stack direction="row" spacing={2}>
                <Avatar src={user.profile_picture} alt={user.name} sx={{ width: 56, height: 56 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                onClick={() => setOpenEdit(true)}
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  "&:hover": { backgroundColor: "#333" },
                  textTransform: "none",
                }}
              >
                Edit Profile
              </Button>
            </Stack>

            {bookmarkedEvents.length > 0 && (
              <Bookmarks userId={user.id} events={bookmarkedEvents} />
            )}

            {followedVendors.length > 0 && (
              <Box mt={4} mb={4}>
                <Typography variant="h5" gutterBottom>Following:</Typography>
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={2}>
                  {followedVendors.map((vendor) => (
                    <RouterLink key={vendor.id} to={`/vendor/${vendor.id}`} style={{ textDecoration: "none" }}>
                      <Card sx={{ display: "flex", alignItems: "center", gap: 2, padding: 2, borderRadius: 3, boxShadow: 2 }}>
                        <Avatar
                          src={vendor.profilePicture || "/default-avatar.png"}
                          alt={vendor.businessName}
                          sx={{ width: 48, height: 48 }}
                        />
                        <Typography fontWeight="bold">{vendor.businessName}</Typography>
                      </Card>
                    </RouterLink>
                  ))}
                </Box>
              </Box>
            )}

            <Typography variant="h5" gutterBottom>Interests:</Typography>
            {preferences.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={4}>
                {preferences.map((cat) => (
                  <Button
                    key={cat.id}
                    startIcon={getCategoryIcon(cat.name)}
                    sx={{
                      backgroundColor: categoryColors[cat.name] || "#999",
                      color: "#fff",
                      textTransform: "none",
                      borderRadius: "20px",
                      "&:hover": {
                        backgroundColor: categoryColors[cat.name] || "#777",
                      },
                    }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </Stack>
            ) : (
              <Typography>No interests selected yet.</Typography>
            )}

            {/* Delete Button at Bottom */}
            <Box display="flex" justifyContent="center" mt={6}>
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmDelete(true)}
                size="medium"
                sx={{ textTransform: "none" }}
              >
                Delete Account
              </Button>
            </Box>

            <EditProfile
              open={openEdit}
              onClose={() => setOpenEdit(false)}
              user={user}
              setUser={setUser}
            />

            <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
              <Box
                sx={{
                  backgroundColor: "white",
                  p: 4,
                  borderRadius: 2,
                  maxWidth: 400,
                  mx: "auto",
                  my: "20vh",
                  textAlign: "center",
                  boxShadow: 24,
                }}
              >
                <Typography variant="h6" mb={2}>
                  Are you sure you want to delete your account?
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteUser}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            </Modal>
          </>
        ) : (
          <Typography>No user found.</Typography>
        )}
      </Container>
    </Box>
  );
};

export default UserProfile;