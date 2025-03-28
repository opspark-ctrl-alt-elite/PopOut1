// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
  Card,


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

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Props = {
  user: User | null;
};

const VendorProfile: React.FC<Props> = ({ user }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    getVendor();
  }, []);

  const getVendor = async () => {
    setVendor( await axios.get(`/vendor/${user.id}`));
  }

  // const [fields, setFields] = useState(null);
  return (
    <div>
      <Container sx={{ display:"flex", justifyContent: 'center', height: '100vh' }}>
        <Stack spacing={2} sx={{ display:"flex", justifyContent: 'center', height: '100vh' }}>
          <h1>PopOut</h1>
          {vendor ? (
            <div>
              <Typography variant="h3">{vendor.businessName}</Typography>
              {vendor.profilePicture && (
                <img src={vendor.profilePicture} alt="Profile" width={50} />
              )}
              <br />
              <Card sx={{ display:"flex", justifyContent: 'center', height: '75vh', width: '60vh' }}>
              <Stack spacing={1} sx={{ display:"flex", justifyContent: 'center', height: '100vh' }}>
                <Button variant="outlined" sx={{ display:"flex", justifyContent: 'center', alignContent: 'center' , height: '10vh', width: '50vh'}}>
                  Active Events
                </Button>
                <Button variant="outlined" sx={{ display:"flex", justifyContent: 'center', alignContent: 'center' , height: '10vh', width: '50vh'}}>
                  Create New Event
                </Button>
                <Button variant="outlined" sx={{ display:"flex", justifyContent: 'center', alignContent: 'center' , height: '10vh', width: '50vh'}}>
                  Reviews
                </Button>
                <Button variant="outlined" sx={{ display:"flex", justifyContent: 'center', alignContent: 'center' , height: '10vh', width: '50vh'}}>
                  View User Profile
                </Button>
              </Stack>
              </Card>
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
