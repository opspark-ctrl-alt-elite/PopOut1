import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Map from "./components/Map";
import Home from "./components/Home";
import VendorSignupForm from "./components/VendorSignupForm";
import UserProfile from "./components/UserProfile";
import VendorProfile from "./components/VendorProfile";
import EditProfile from "./components/EditProfile";
import Preferences from "./components/Preferences";
import CreateEvent from "./components/CreateEvent";
import EditEvent from "./components/EditEvent";
import ActiveEvents from "./components/ActiveEvents";
import EventsFeed from "./components/EventsFeed";
import GameApp from "./components/gameComponents/GameApp";
import PublicVendorProfile from "./components/PublicVendorProfile";
import TopVendorSpotlight from "./components/TopVendorSpotlight";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import NotificationListener from "./components/NotificationListener";

import { registerServiceWorker } from "./firebase/sw-registration";
import { requestNotificationPermission } from "./firebase/requestPermission";
import { onMessageListener } from "./firebase/onMessageListener";
import axios from "axios";
import { Box } from "@mui/material";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  Categories?: { id: number; name: string }[];
  is_vendor?: boolean;
};

type Vendor = {
  id: string;
  businessName: string;
  email: string;
  profilePicture?: string;
  description: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
};

type Category = { id: number; name: string };

type Captcha = {
  beatCaptcha: boolean;
  wantsToBeVendor: boolean;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [vendors, setVendors] = useState<Vendor[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [captcha, setCaptcha] = useState<Captcha>({
    beatCaptcha: false,
    wantsToBeVendor: false,
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  const getCategories = async () => {
    try {
      const res = await axios.get("/api/categories", { withCredentials: true });
      setCategories(res.data);
    } catch (err) {
      setCategories(null);
      console.error("Error retrieving categories:", err);
    }
  };

  const getUser = async () => {
    try {
      const res = await axios.get("/user/me", { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      setUser(null);
      console.error("Error retrieving user:", err);
    }
  };

  /* ─── Effects ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    registerServiceWorker();

    fetch("/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("err fetching user");
        return res.json();
      })
      .then((data) => {
        if (data?.id) setUser(data);
      })
      .catch((err) => console.error("Error fetching user:", err));

    axios
      .get("api/vendor/all")
      .then((res) => {
        if (res) setVendors(res.data);
      })
      .catch(() => {});

    getCategories();
  }, []);

  useEffect(() => {
    if (user?.id) requestNotificationPermission(user.id);
  }, [user]);

  useEffect(() => {
    onMessageListener().then((payload: any) => {
      setNotifications((prev) => [payload.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  }, []);

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      <NotificationListener />

      {/* FLEX LAYOUT ENSURES FOOTER STAYS AT SCREEN BOTTOM */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Navbar
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          setNotifications={setNotifications}
        />

        {/* Main content area grows to push footer down */}
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  user={user}
                  vendors={vendors}
                  captcha={captcha}
                  setCaptcha={setCaptcha}
                  notifications={notifications}
                  unreadCount={unreadCount}
                  setUnreadCount={setUnreadCount}
                  setNotifications={setNotifications}
                />
              }
            />
            <Route path="/map" element={<Map user={user} />} />
            <Route path="/edit-profile" element={<EditProfile user={user} />} />
            <Route
              path="/userprofile"
              element={
                <UserProfile
                  user={user}
                  setUser={setUser}
                  categories={categories}
                />
              }
            />
            <Route
              path="/vendorprofile"
              element={<VendorProfile user={user} getUser={getUser} />}
            />
            <Route
              path="/vendor-signup"
              element={
                <VendorSignupForm
                  user={user}
                  getUser={getUser}
                  captcha={captcha}
                  setCaptcha={setCaptcha}
                />
              }
            />
            <Route
              path="/preferences"
              element={<Preferences setUser={setUser} />}
            />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/edit-event/:id" element={<EditEvent />} />
            <Route path="/active-events" element={<ActiveEvents user={user} />} />
            <Route path="/events" element={<EventsFeed />} />
            <Route
              path="/game"
              element={<GameApp captcha={captcha} setCaptcha={setCaptcha} />}
            />
            <Route path="/vendor-spotlight" element={<TopVendorSpotlight />} />
            <Route
              path="/vendor/:vendorId"
              element={<PublicVendorProfile user={user} />}
            />
          </Routes>
        </Box>

        {/* Sticky‑to‑bottom footer */}
        <Footer user={user} />
      </Box>
    </>
  );
};

export default App;
