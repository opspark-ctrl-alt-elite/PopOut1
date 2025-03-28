import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Map from "./components/Map";
import Home from "./components/Home";
import VendorSignupForm from "./components/VendorSignupForm";
import UserProfile from "./components/UserProfile";
import VendorProfile from "./components/VendorProfile";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  
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
    fetch("/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("err fetching user");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.id) {
          setUser(data);
        }
      })
      .catch((err) => {
        // console.error( err);
      });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home user={user} vendors={vendors} />} />
      <Route path="/map" element={<Map />} />
      <Route path="/userprofile" element={<UserProfile user={user} />} />
      <Route path="/vendorprofile" element={<VendorProfile />} />
      <Route path="/vendor-signup" element={<VendorSignupForm user={user} />} />
    </Routes>
  );
};

export default App;
