// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Box,
  Modal,
  Button,
  Container,
  Grid2,
  Tooltip,
  IconButton,
  Stack,
  Typography,


} from "@mui/material";

import {
  Circle
} from "@mui/icons-material";

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
  // const [fields, setFields] = useState(null);
  return (
    <div>
      <Container sx={{ display:"flex", justifyContent: 'center', height: '100vh' }}>
        <Stack spacing={2} sx={{ display:"flex", justifyContent: 'center', height: '100vh' }}>
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
            <Stack spacing={2} sx={{ display:"flex", justifyContent: 'center', height: '100vh' }}>
              <Typography variant="h4">No Vendor Found</Typography>
              <Link to="/">Home</Link>
            </Stack>
          )}
        </Stack>
      </Container>
    </div>
  );
};

export default VendorProfile;
