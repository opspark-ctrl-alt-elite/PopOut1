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
} from "@mui/material";

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
    if (!window.confirm("Are you sure you want to delete your account?")) return;
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
              <Button variant="outlined" size="small" onClick={() => setOpenEdit(true)}>Edit Profile</Button>
            </Stack>

            {bookmarkedEvents.length > 0 && <Bookmarks userId={user.id} events={bookmarkedEvents} />}

            {followedVendors.length > 0 && (
              <Box mt={4} mb={4}>
                <Typography variant="h6" gutterBottom>Following:</Typography>
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={2}>
                  {followedVendors.map((vendor) => (
                    <RouterLink key={vendor.id} to={`/vendor/${vendor.id}`} style={{ textDecoration: "none" }}>
                      <Card sx={{ display: "flex", alignItems: "center", gap: 2, padding: 2, borderRadius: 3, boxShadow: 2 }}>
                        <Avatar src={vendor.profilePicture || "/default-avatar.png"} alt={vendor.businessName} sx={{ width: 48, height: 48 }} />
                        <Typography fontWeight="bold">{vendor.businessName}</Typography>
                      </Card>
                    </RouterLink>
                  ))}
                </Box>
              </Box>
            )}

            <Typography variant="h6" fontWeight="bold" gutterBottom>Preferences:</Typography>
            {preferences.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={4}>
                {preferences.map((cat) => (
                  <Box key={cat.id} sx={{ px: 2, py: 1, borderRadius: "8px", backgroundColor: "#e0e0e0", fontWeight: "bold" }}>
                    {cat.name}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography>No preferences selected yet.</Typography>
            )}

            <Stack spacing={2}>
              {/* 🔥 Removed User Preferences button here */}
              <Divider />
              {user.is_vendor ? (
                <Button component={RouterLink} to="/vendorprofile" variant="text" fullWidth>View Vendor Profile</Button>
              ) : (
                <Button component={RouterLink} to="/vendor-signup" variant="outlined" fullWidth>Become a Vendor</Button>
              )}
              <Divider />
              <Button variant="outlined" color="error" fullWidth onClick={handleDeleteUser}>
                Delete My Account
              </Button>
            </Stack>

            <EditProfile
              open={openEdit}
              onClose={() => setOpenEdit(false)}
              user={user}
              setUser={setUser}
            />
          </>
        ) : (
          <Typography>No user found.</Typography>
        )}
      </Container>
    </Box>
  );
};

export default UserProfile;