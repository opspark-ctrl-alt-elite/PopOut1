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
  Chip,
  TextField,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
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

type Fields = {
  businessName?: string;
  email?: string;
  profilePicture?: string;
  description?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
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
  // set default state values;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [fields, setFields] = useState<Fields>({
    businessName: "",
    email: "",
    profilePicture: "",
    description: "",
    website: "",
    instagram: "",
    facebook: "",
  });
  // modal states
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  useEffect(() => {
    getVendor();
  }, []);

  // gets the vendor record associated with the current user and uses
  // said record to update the vendor in state
  const getVendor = async () => {
    try {
      // send the GET request
      const vendorObj = await axios.get(`/vendor/${user.id}`);
      console.log("retrieved vendor object for current user:");
      console.log(vendorObj);
      setVendor(vendorObj.data);
    } catch (err) {
      // error handling
      // set the vendor in state to null
      // ADVISE: MAY REPLACE WITH SIMPLY RETURNING NULL FROM HTTP HANDLER
      setVendor(null);
      console.error("Error retrieving vendor record: ", err);
    }
  };

  // alters the current user's vendor record with changes from the fields in state
  const updateVendor = async () => {
    try {
      // trim off any field values that are empty strings
      const trimmedFields = {};
      const keys: string[] = Object.keys(fields);
      for (let i = 0; i < keys.length; i++) {
        if (fields[keys[i]] !== "") {
          trimmedFields[keys[i]] = fields[keys[i]];
        }
      }

      // send the PATCH request
      const vendorObj = await axios.patch(`/vendor/${user.id}`, trimmedFields);
      console.log("updated vendor object for current user:");
      // update vendor state
      getVendor();
    } catch (err) {
      // error handling
      console.error("Error updating vendor record: ", err);
    }
  };

  // deletes the current user's vendor record from the state
  const deleteVendor = async () => {
    try {
      // send the DELETE request
      const vendorObj = await axios.delete(`/vendor/${user.id}`);
      console.log("deleted vendor object for current user:");
      // update vendor state
      getVendor();
    } catch (err) {
      // error handling
      console.error("Error deleting vendor record: ", err);
    }
  };

  const handleUpdateFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  console.log(vendor);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>
      {/* HEADER */}
      <AppBar position="static" sx={{ bgcolor: "#fff", color: "#000" }}>
        <Toolbar sx={{ justifyContent: "space-between", px: 2, py: 1 }}>
          <Typography
            component={Link}
            to="/"
            variant="h5"
            fontWeight="bold"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            PopOut
          </Typography>
          {user && (
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton component={Link} to="/userprofile">
                <Avatar
                  src={user.profile_picture}
                  alt={user.name}
                  sx={{ width: 40, height: 40 }}
                />
              </IconButton>
              <Button variant="outlined" href="/auth/logout" color="error">
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {vendor ? (
          <Box>
            {/* Top Row: Name, Email, Avatar, Edit Profile */}
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
                  src={vendor.profilePicture}
                  alt={vendor.businessName}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {vendor.businessName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vendor.email}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenEdit(true)}
              >
                Edit Profile
              </Button>
            </Stack>

            {/* profile links */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                component={Link}
                to="/active-events"
              >
                Active Events
              </Button>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/create-event"
              >
                Create New Event
              </Button>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/reviews"
              >
                Reviews
              </Button>
              <Divider />
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/userprofile"
              >
                View User Profile
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => setOpenDelete(true)}
              >
                Delete Vendor
              </Button>
            </Stack>

            {/* edit vendor */}
            <Modal open={openEdit}>
              <Box sx={style}>
                <Typography variant="h6" component="h2">
                  Edit Vendor Profile
                </Typography>
                <TextField
                  name="businessName"
                  label="Business Name"
                  fullWidth
                  margin="normal"
                  value={fields.businessName}
                  onChange={handleUpdateFieldChange}
                />
                <TextField
                  name="email"
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={fields.email}
                  onChange={handleUpdateFieldChange}
                />
                <TextField
                  name="profilePicture"
                  label="Profile Picture Link"
                  fullWidth
                  margin="normal"
                  value={fields.profilePicture}
                  onChange={handleUpdateFieldChange}
                />
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  margin="normal"
                  value={fields.description}
                  onChange={handleUpdateFieldChange}
                />
                <TextField
                  name="website"
                  label="Website"
                  fullWidth
                  margin="normal"
                  value={fields.website}
                  onChange={handleUpdateFieldChange}
                />
                <TextField
                  name="instagram"
                  label="Instagram Link"
                  fullWidth
                  margin="normal"
                  value={fields.instagram}
                  onChange={handleUpdateFieldChange}
                />
                <TextField
                  name="facebook"
                  label="Facebook Link"
                  fullWidth
                  margin="normal"
                  value={fields.facebook}
                  onChange={handleUpdateFieldChange}
                />
                <Button
                  onClick={() => {
                    updateVendor();
                    setOpenEdit(false);
                  }}
                  variant="outlined"
                >
                  Confirm
                </Button>
                <Button
                  onClick={() => {
                    setOpenEdit(false);
                  }}
                  variant="outlined"
                >
                  Cancel
                </Button>
              </Box>
            </Modal>

            {/* delete vendor */}
            <Modal open={openDelete}>
              <Box sx={style}>
                <Typography variant="h6" component="h2">
                  Are you sure?
                </Typography>
                <Button
                  onClick={() => {
                    deleteVendor();
                    setOpenDelete(false);
                  }}
                  variant="outlined"
                  color="error"
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setOpenDelete(false);
                  }}
                  variant="outlined"
                >
                  No
                </Button>
              </Box>
            </Modal>
          </Box>
        ) : (
          <Typography variant="h4" textAlign="center" mt={4}>
            No Vendor Found
          </Typography>
        )}
      </Container>
    </div>
  );
};

export default VendorProfile;
