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
import { registerServiceWorker } from "./firebase/sw-registration";
import { requestNotificationPermission } from "./firebase/requestPermission";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  Categories?: { id: number; name: string }[];

  
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [vendors, setVendors] = useState<Vendor[] | null>(null);

  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();

    // get current user
    fetch("/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("err fetching user");
        return res.json();
      })
      .then((data) => {
        if (data && data.id) setUser(data);
      })
      .catch((err) => {
        // console.error(err);
      });

    // Get all vendor records
    fetch("/vendor/all")
      .then((res) => {
        if (!res.ok) throw new Error("err fetching vendors");
        return res.json();
      })
      .then((data) => {
        console.log("Client Side: getting all vendors: ", data);
        if (data) setVendors(data);
      })
      .catch((err) => {
        // console.error(err);
      });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home user={user} vendors={vendors} />} />
      <Route path="/map" element={<Map user={user} />} />
      <Route path="/userprofile" element={<UserProfile user={user} />} />
      <Route path="/edit-profile" element={<EditProfile user={user} />} />
      <Route path="/vendorprofile" element={<VendorProfile user={user} />} />
      <Route path="/vendor-signup" element={<VendorSignupForm user={user} />} />
      <Route path="/preferences" element={<Preferences setUser={setUser} />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/edit-event/:id" element={<EditEvent />} />
      <Route path="/active-events" element={<ActiveEvents user={user} />} />
      <Route path="/events" element={<EventsFeed />} />
    </Routes>
  );
};

export default App;
