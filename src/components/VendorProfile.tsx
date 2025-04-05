import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ImageUpload from "./ImageUpload";

// img imports
import facebookImg from "../../public/includedImages/facebook.png";
import instagramImg from "../../public/includedImages/instagram.png";
import websiteImg from "../../public/includedImages/website.png";

import {
  Box,
  Modal,
  Button,
  Container,
  Tooltip,
  IconButton,
  Stack,
  Typography,
  Card,
  Chip,
  Grid2,
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
  profilePicture?: any;
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

  // states used to toggle the modals
  const [openDelete, setOpenDelete] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  // create a style for the box that the modal holds
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

  useEffect(() => {
    getVendor();
  }, []);

  const getVendor = async () => {
    try {
      const vendorObj = await axios.get(`/api/vendor/${user?.id}`, {
        withCredentials: true,
      });
      setVendor(vendorObj.data);
    } catch (err) {
      setVendor(null);
      console.error("Error retrieving vendor record: ", err);
    }
  };

  const updateVendor = async () => {
    try {
      const trimmedFields: Record<string, any> = {};
      const keys: string[] = Object.keys(fields);
      for (let i = 0; i < keys.length; i++) {
        if (fields[keys[i]] !== "") {
          trimmedFields[keys[i]] = fields[keys[i]];
        }
      }

      await axios.patch(`/api/vendor/${user?.id}`, trimmedFields, {
        withCredentials: true,
      });
      getVendor();
    } catch (err) {
      console.error("Error updating vendor record: ", err);
    }
  };

  const deleteVendor = async () => {
    try {
      await axios.delete(`/api/vendor/${user?.id}`, {
        withCredentials: true,
      });
      getVendor();
    } catch (err) {
      console.error("Error deleting vendor record: ", err);
    }
  };

  // handle inputs to the fields by saving them to the state
  const handleUpdateFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(fields);
  };

  return (
    <div>
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
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={4}
              sx={{ mb: 4 }}
              flexWrap="wrap"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Avatar
                    src={vendor.profilePicture}
                    alt={vendor.businessName}
                    sx={{ width: 56, height: 56 }}
                  />
                  <ImageUpload foreignKeyName="vendorId" foreignKey={vendor.id} multi={false} />
                </Box>
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

            <Grid2 container spacing={2} sx={{ mb: 4 }}>
              <Grid2 size={8}>
                <Typography variant="body2" fontWeight="bold">Description:</Typography>
                <Typography variant="body2">{vendor.description}</Typography>
              </Grid2>
              <Grid2 container size={4} justifyContent="center">
                {/* <Grid2 size={{ xs: 3, sm: 0 }}>
                  filler grid that changes size to better fit elements on phone screen
                </Grid2> */}
                <Grid2 size={12}>
                  <a href={vendor.facebook}>
                    {/* <Typography>Facebook</Typography> */}
                    <Avatar
                      src={facebookImg}
                      alt={vendor.facebook}
                      sx={{ width: 40, height: 40 }}
                    />
                  </a>
                </Grid2>
                <Grid2 size={12}>
                  <a href={vendor.instagram}>
                    {/* <Typography>Instagram</Typography> */}
                    <Avatar
                      src={instagramImg}
                      alt={vendor.instagram}
                      sx={{ width: 40, height: 40 }}
                    />
                  </a>
                </Grid2>
                <Grid2 size={12}>
                  <a href={vendor.website}>
                    <Typography>Website</Typography>
                    <Avatar
                      src={websiteImg}
                      alt={vendor.website}
                      sx={{ width: 40, height: 40 }}
                    />
                  </a>
                </Grid2>
              </Grid2>
            </Grid2>

            {/* <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={4}
              sx={{ mb: 4 }}
              flexWrap="wrap"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {vendor.businessName}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {vendor.description}
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
            </Stack> */}

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
                {/* Two different methods for adding a vendor profile */}
                {/* <Box sx={{ outline: 5 }}>
                  <Typography>
                    Add image url or upload image
                  </Typography>
                  <TextField
                    name="profilePicture"
                    label="Profile Picture Link"
                    fullWidth
                    margin="normal"
                    value={fields.profilePicture}
                    onChange={handleUpdateFieldChange}
                  />
                  <ImageUpload setInputData={setFields} imageKeyName="profilePicture" multiple={false} />
                </Box> */}
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
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setOpenDelete(false);
                  }}
                  variant="outlined"
                  color="error"
                >
                  No
                </Button>
              </Box>
            </Modal>
          </Box>
        ) : (
          <Box>
            <Typography variant="h4" textAlign="center" mt={4}>
              No Vendor Found
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/"
            >
              Home
            </Button>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/vendor-signup"
            >
              Become a Vendor
            </Button>
          </Box>
        )}
      </Container>
    </div>
  );
};

export default VendorProfile;
