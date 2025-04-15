import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// import ImageUpload from "./ImageUpload";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  Box,
  Modal,
  Button,
  Container,
  Tooltip,
  IconButton,
  Stack,
  Typography,
  TextField,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const HiddenInput = styled("input")({
  display: "none",
});

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
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // create a style for the box that the modal holds
  const style = {
    position: "absolute" as const,
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
    if (vendor) getUploadedImage();
  }, [vendor]);

  // gets the vendor associated with the user
  const getVendor = async () => {
    try {
      const res = await axios.get(`/api/vendor/${user?.id}`, {
        withCredentials: true,
      });
      // set state's vendor value
      setVendor(res.data);
    } catch (err) {
      // set vendor to null when no vendor can be found
      setVendor(null);
      console.error("Error retrieving vendor record:", err);
    }
  };

  // gets the uploaded image associated with the vendor
  const getUploadedImage = async () => {
    try {
      const res = await axios.get(`/api/images/vendorId/${vendor?.id}`, {
        withCredentials: true,
      });
      // set state's uploaded image value to the first (and only) image record in the imageRes.data array
      setUploadedImage(res.data[0]);
    } catch (err) {
      // set uploaded image to null when no uploaded image can be found or when another error occurs
      setUploadedImage(null);
      console.error("Error retrieving uploaded image record for vendor: ", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !vendor) return;

    const formData = new FormData();
    Array.from(e.target.files).forEach((file) =>
      formData.append("imageUpload", file)
    );

    const uploadUrl = uploadedImage?.publicId
      ? `/api/images/${uploadedImage.publicId}`
      : `/api/images/vendorId/${vendor.id}`;

    try {
      await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      await getUploadedImage();
    } catch (err) {
      console.error("err uploading image", err);
    }
  };

  // deletes the uploaded Image
  const deleteUploadedImage = async () => {
    if (!uploadedImage) return;
    try {
      await axios.delete("/api/images/", {
        withCredentials: true,
        data: { publicIds: [uploadedImage.publicId] },
      });
      getUploadedImage();
    } catch (err) {
      console.error("err deleting image", err);
    }
  };

  // updates the vendor account
  const updateVendor = async () => {
    try {
      const trimmedFields: Record<string, any> = {};
      for (const key in fields) {
        if (fields[key as keyof Fields]) {
          trimmedFields[key] = fields[key as keyof Fields];
        }
      }
      await axios.patch(`/api/vendor/${user?.id}`, trimmedFields, {
        withCredentials: true,
      });
      getVendor();
    } catch (err) {
      console.error("Error updating vendor:", err);
    }
  };

  // deletes the vendor account
  const deleteVendor = async () => {
    try {
      // preemptively delete the vendor's uploaded image if there is one
      await deleteUploadedImage();
      await axios.delete(`/api/vendor/${user?.id}`, { withCredentials: true });
      // update the user in state to reflect vendor status
      await getUser();
      getVendor();
    } catch (err) {
      console.error("Error deleting vendor record: ", err);
    }
  };

  // handle inputs to the fields by saving them to the state
  const handleUpdateFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
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
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Stack direction="row" spacing={2}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={uploadedImage?.referenceURL || vendor.profilePicture}
                    alt={vendor.businessName}
                    sx={{ width: 100, height: 100 }}
                  />
                  {/* upload img */}
                  <HiddenInput
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="profile-upload">
                    <Tooltip title="Change Profile Image">
                      <IconButton
                        component="span"
                        size="small"
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          boxShadow: 1,
                          p: 0.5,
                        }}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </label>
                  {uploadedImage && (
                    <Tooltip title="Delete Image">
                      <IconButton
                        onClick={deleteUploadedImage}
                        size="small"
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          boxShadow: 1,
                          p: 0.5,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {vendor.businessName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vendor.email}
                  </Typography>
                  {vendor.description && (
                    <Typography variant="body2" color="text.primary" mt={1}>
                      {vendor.description}
                    </Typography>
                  )}
                </Box>
              </Stack>

              {/* socials, edit */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                {vendor.facebook && (
                  <Tooltip title="Facebook">
                    <IconButton
                      href={vendor.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#1877F2" }}
                    >
                      <FacebookIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {vendor.instagram && (
                  <Tooltip title="Instagram">
                    <IconButton
                      href={vendor.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#E4405F" }}
                    >
                      <InstagramIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {vendor.website && (
                  <Tooltip title="Website">
                    <IconButton
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#34A853" }}
                    >
                      <LanguageIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setOpenEdit(true)}
                  sx={{ ml: 1 }}
                >
                  Edit Profile
                </Button>
              </Stack>
            </Stack>

            {/* links */}
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

            {/* edit profile */}
            <Modal open={openEdit}>
              <Box sx={style}>
                <Typography variant="h6">Edit Vendor Profile</Typography>
                {Object.keys(fields).map((key) => (
                  <TextField
                    key={key}
                    name={key}
                    label={
                      key[0].toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")
                    }
                    fullWidth
                    margin="normal"
                    value={fields[key as keyof Fields]}
                    onChange={handleUpdateFieldChange}
                  />
                ))}
                <Button
                  onClick={() => {
                    updateVendor();
                    setOpenEdit(false);
                  }}
                  variant="outlined"
                >
                  Confirm
                </Button>
                <Button onClick={() => setOpenEdit(false)} variant="outlined">
                  Cancel
                </Button>
              </Box>
            </Modal>

            {/* delete */}
            <Modal open={openDelete}>
              <Box sx={style}>
                <Typography variant="h6">Are you sure?</Typography>
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
                  onClick={() => setOpenDelete(false)}
                  variant="outlined"
                  color="error"
                >
                  No
                </Button>
              </Box>
            </Modal>
          </Box>
        ) : (
          <Box textAlign="center">
            <Typography variant="h4" mt={4}>
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
