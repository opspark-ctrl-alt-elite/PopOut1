import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ImageUpload from "./ImageUpload";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";

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

type UploadedImage = {
  id: string;
  publicId: string;
  referenceURL: string;
  vendorId?: string | null;
  eventId?: string | null;
};

type Props = {
  user: User | null;
  getUser: Function;
};

const VendorProfile: React.FC<Props> = ({ user, getUser }) => {
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
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null
  );

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

  useEffect(() => {
    if (vendor) {
      getUploadedImage();
    }
  }, [vendor]);

  // gets the vendor associated with the user
  const getVendor = async () => {
    try {
      const vendorObj = await axios.get(`/api/vendor/${user?.id}`, {
        withCredentials: true,
      });
      // set state's vendor value
      setVendor(vendorObj.data);
    } catch (err) {
      // set vendor to null when no vendor can be found
      setVendor(null);
      console.error("Error retrieving vendor record: ", err);
    }
  };

  // gets the uploaded image associated with the vendor
  const getUploadedImage = async () => {
    try {
      const imageRes = await axios.get(`/api/images/vendorId/${vendor?.id}`, {
        withCredentials: true,
      });
      // set state's uploaded image value to the first (and only) image record in the imageRes.data array
      console.log(imageRes.data[0]);
      setUploadedImage(imageRes.data[0]);
    } catch (err) {
      // set uploaded image to null when no uploaded image can be found or when another error occurs
      setUploadedImage(null);
      console.error("Error retrieving uploaded image record for vendor: ", err);
    }
  };

  // updates the vendor account
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

  // deletes the vendor account
  const deleteVendor = async () => {
    try {
      await axios.delete(`/api/vendor/${user?.id}`, {
        withCredentials: true,
      });

      // update the user in state to reflect vendor status
      await getUser();

      getVendor();
    } catch (err) {
      console.error("Error deleting vendor record: ", err);
    }
  };

  // deletes the uploaded Image
  const deleteUploadedImage = async () => {
    // create config object so that the delete request can have a body
    const config = {
      method: "delete",
      url: "/api/images/",
      withCredentials: true,
      data: {
        publicIds: [uploadedImage?.publicId],
      },
    };
    try {
      await axios(config);
      getUploadedImage();
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
                    src={
                      uploadedImage
                        ? uploadedImage.referenceURL
                        : vendor.profilePicture
                    }
                    alt={vendor.businessName}
                    sx={{ width: 56, height: 56 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Uploaded Images override a vendor's url image until they are
                    deleted
                  </Typography>
                  <ImageUpload
                    foreignKeyName="vendorId"
                    foreignKey={vendor.id}
                    multi={false}
                    getImages={getUploadedImage}
                    publicIds={[uploadedImage?.publicId]}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={deleteUploadedImage}
                  >
                    Delete Uploaded Image
                  </Button>
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

            <Grid2 container size={4} justifyContent="center" spacing={2}>
              {vendor.facebook && (
                <Grid2>
                  <Tooltip title="Facebook">
                    <IconButton
                      component="a"
                      href={vendor.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#1877F2" }}
                    >
                      <FacebookIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Grid2>
              )}
              {vendor.instagram && (
                <Grid2>
                  <Tooltip title="Instagram">
                    <IconButton
                      component="a"
                      href={vendor.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#E4405F" }}
                    >
                      <InstagramIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Grid2>
              )}
              {vendor.website && (
                <Grid2>
                  <Tooltip title="Website">
                    <IconButton
                      component="a"
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#34A853" }}
                    >
                      <LanguageIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </Grid2>
              )}
            </Grid2>

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
            <Button variant="outlined" fullWidth component={Link} to="/">
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
