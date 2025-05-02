import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

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
  description: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  profilePicture?: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
};

type Fields = {
  businessName?: string;
  email?: string;
  description?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  profilePicture?: any;
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
    description: "",
    website: "",
    instagram: "",
    facebook: "",
    profilePicture: "",
  });
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null
  );

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

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
  }, [user]);

  useEffect(() => {
    if (vendor) {
      getUploadedImage();
      const {
        businessName,
        email,
        description,
        website,
        instagram,
        facebook,
        profilePicture,
      } = vendor;
      setFields({
        businessName,
        email,
        description,
        website: website ? website : "",
        instagram: instagram ? instagram : "",
        facebook: facebook ? facebook : "",
        profilePicture: profilePicture ? profilePicture : "",
      });
    }
  }, [vendor]);

  const getVendor = async () => {
    try {
      const res = await axios.get(`/api/vendor/${user?.id}`, {
        withCredentials: true,
      });
      setVendor(res.data);
    } catch (err) {
      setVendor(null);
      console.error("Error retrieving vendor record:", err);
    }
  };

  const getUploadedImage = async () => {
    try {
      const res = await axios.get(`/api/images/vendorId/${vendor?.id}`, {
        withCredentials: true,
      });
      setUploadedImage(res.data[0]);
    } catch (err) {
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

  const deleteVendor = async () => {
    try {
      await deleteUploadedImage();
      await axios.delete(`/api/vendor/${user?.id}`, { withCredentials: true });
      getUser();
    } catch (err) {
      console.error("Error deleting vendor record: ", err);
    }
  };

  const handleUpdateFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {vendor ? (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
              sx={{ mb: 4 }}
            >
              {/* header */}
              <Stack direction="row" spacing={2}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={uploadedImage?.referenceURL || vendor.profilePicture}
                    alt={vendor.businessName}
                    sx={{ width: 100, height: 100 }}
                  />
                  {/* upload, delete */}
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {vendor.facebook && (
                  <Tooltip title="Facebook">
                    <IconButton
                      href={vendor.facebook}
                      target="_blank"
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
                >
                  Edit Profile
                </Button>
              </Box>
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* links */}
            <Stack direction="row" spacing={4} justifyContent="center" my={3}>
              {/* my popups */}
              <Button
                component={Link}
                to="/active-events"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textTransform: "none",
                  px: 4,
                  py: 2,
                  backgroundColor: "#42a5f5",
                  color: "#fff",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#1e88e5",
                  },
                }}
              >
                <Box sx={{ fontSize: 40, lineHeight: 1 }}>
                  <EventNoteIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="subtitle1">My Popups</Typography>
              </Button>

              {/* new popup*/}
              <Button
                component={Link}
                to="/create-event"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textTransform: "none",
                  px: 4,
                  py: 2,
                  backgroundColor: "#42a5f5",
                  color: "#fff",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#1e88e5",
                  },
                }}
              >
                <Box sx={{ fontSize: 40, lineHeight: 1 }}>
                  <AddCircleOutlineIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="subtitle1">New Popup</Typography>
              </Button>
            </Stack>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 4,
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={() => setOpenDelete(true)}
                sx={{
                  backgroundColor: "#b71c1c",
                  color: "#fff",
                  fontSize: "0.8125rem",
                  textTransform: "none",
                  px: 2,
                  py: 0.5,
                  boxShadow: 1,
                  "&:hover": {
                    backgroundColor: "#fbe9e7",
                    borderColor: "#b71c1c",
                    color: "#b71c1c",
                  },
                }}
              >
                Delete Profile
              </Button>
            </Box>

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
                    placeholder={
                      ["website", "instagram", "facebook"].includes(key)
                        ? "Link must start with http://"
                        : undefined
                    }
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
