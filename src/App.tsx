import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Map from "./components/Map";
import Home from "./components/Home";
import VendorSignupForm from "./components/VendorSignupForm";
import UserProfile from "./components/UserProfile";
import VendorProfile from "./components/VendorProfile";
import EditProfile from "./components/EditProfile";

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
    // get the user record associated with the current user
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

      // get all vendor records
      fetch("/vendor/all")
        .then((res) => {
          if (!res.ok) {
            throw new Error("err fetching vendors");
          }
          return res.json();
        })
        .then((data) => {
          console.log("Client Side: getting all vendors: ", data);
          if (data) {
            setVendors(data);
          }
        })
        .catch((err) => {
          // console.error( err);
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
    </Routes>
  );
};

export default App;
