// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Box,
  Modal,
  Button,

} from "@mui/material";

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

const VendorProfile: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  return (
    <div>
      <h1>PopOut</h1>
      {vendor ? (
        <div>
          <p>Welcome, {vendor.businessName}</p>
          {vendor.profilePicture && (
            <img src={vendor.profilePicture} alt="Profile" width={50} />
          )}
          <br />
          <a href="/auth/logout">Logout</a>
          <br />
          <Link to="/">Home</Link>
          <br />
          <Link to="/userprofile">View User Profile</Link>
        </div>
      ) : (
        // <a href="/auth/google">Login with Google</a>
        <div>no vendor found</div>
      )}
    </div>
  );
};

export default VendorProfile;
