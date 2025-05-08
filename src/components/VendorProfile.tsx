import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import EditVendor from "./EditVendor";

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
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CheckCircle,
  Error
} from "@mui/icons-material";

const HiddenInput = styled("input")({
  display: "none",
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
}));

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
  businessName: string;
  email: string;
  description: string;
  website: string;
  instagram: string;
  facebook: string;
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
  userId: string;
  vendorId: string;
  eventId?: string | null;
};

type Props = {
  user: User | null;
  getUser: Function;
  vendor: Vendor | null;
  getVendor: Function;
};

type ModalType = {
  open: boolean;
  title: string;
  message: string;
  success: boolean;
}

const VendorProfile: React.FC<Props> = ({ user, getUser, vendor, getVendor }) => {
  const [fields, setFields] = useState<Fields>({
    businessName: "",
    email: "",
    description: "",
    website: "",
    instagram: "",
    facebook: "",
  });
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null
  );

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // states related to error handling with the "edit vendor" form
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [modal, setModal] = useState<ModalType>({
    open: false,
    title: '',
    message: '',
    success: false,
  });
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

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
      } = vendor;
      setFields({
        businessName,
        email,
        description,
        website: website ? website : "",
        instagram: instagram ? instagram : "",
        facebook: facebook ? facebook : "",
      });
    }
  }, [vendor]);

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
    Array.from(e.target.files).forEach((file) => {
      formData.append("file", file);
    });

    const uploadUrl = uploadedImage?.publicId
      ? `/api/images/${uploadedImage.publicId}`
      : `/api/images/${user ? user.id : "null"}/${vendor.id}/null`;

    try {
      const res = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      // replace the quick-access vendor image url on the vendor record with the url associated with the uploaded image
      await axios.patch(
        `/api/vendor/${user?.id}`,
        { profilePicture: res.data[0].url },
        { withCredentials: true }
      );
      // update image and vendor states
      await getUploadedImage();
      getVendor();
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
      // delete the quick-access vendor image url on the vendor record and replace the column's value with null
      await axios.patch(
        `/api/vendor/${user?.id}`,
        { profilePicture: "" },
        { withCredentials: true }
      );
      // update image and vendor states
      await getVendor();
      setUploadedImage(null);
    } catch (err) {
      console.error("err deleting image", err);
    }
  };

  // helper function that checks the validity of emails and urls
  const emailAndURLChecker = (type: string, value: string) => {
    // create an element with the given type and value
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    // check if the value is valid for the given type
    return input.checkValidity();
  }

  // function to determine whether or not the form is ready to be submitted
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // check if required fields are present and aren't over the character limit
    if (!fields.businessName) newErrors.businessName = 'Business name is required';
    else if (fields.businessName.length > 50) newErrors.businessName = 'Business name must be 50 characters or less';
    if (!fields.description) newErrors.description = 'Description is required';
    else if (fields.description.length > 100) newErrors.description = 'Description must be 100 characters or less';
    if (!fields.email) newErrors.email = 'Email is required';
    else if (fields.email.length > 255) newErrors.email = 'Email length must be at or below the default limit (255 characters)';

    // make sure that email is valid
     else if (!fields.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) newErrors.email = 'Email address should be valid';
     else if (!emailAndURLChecker('email', fields.email)) newErrors.email = 'Email address should be valid';

    // if facebook profile link was given, check if valid and has proper length
    if (fields.facebook) {
      if (fields.facebook.length > 255) newErrors.facebook = 'Facebook link length must be at or below the default limit (255 characters)';
      else if (fields.facebook.slice(0, 25) !== 'https://www.facebook.com/' || fields.facebook.length === 25) newErrors.facebook = 'Facebook link must follow this format "https://www.facebook.com/YourAccountNameHere"';
      else if (!emailAndURLChecker('url', fields.facebook)) newErrors.facebook = 'Facebook link should be valid';
    }
    // if instagram profile link was given, check if valid and has proper length
    if (fields.instagram) {
      if (fields.instagram.length > 255) newErrors.instagram = 'Instagram link length must be at or below the default limit (255 characters)';
      else if (fields.instagram.slice(0, 26) !== 'https://www.instagram.com/' || fields.instagram.length === 26) newErrors.instagram = 'Instagram link must follow this format "https://www.instagram.com/YourAccountNameHere"';
      else if (!emailAndURLChecker('url', fields.instagram)) newErrors.instagram = 'Instagram link should be valid';
    }
    // if store website link was given, check if the website at least has https and has proper length
    if (fields.website) {
      if (fields.website.length > 255) newErrors.website = 'Store link length must be at or below the default limit (255 characters)';
      else if (fields.website.slice(0, 8) !== 'https://' || fields.website.length === 8) newErrors.website = 'Online store link must have https support (no http)';
      else if (!emailAndURLChecker('url', fields.website)) newErrors.website = 'Online store link should be valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // check for validity with every change made to the form
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };
  
  // determine whether or not to close "EditVendor" modal after closing Success/Error modal
  // also handles regular closing of "EditVendor" modal
  const handleModalClose = (force: boolean) => {
    setModal((prev) => ({ ...prev, open: false }));
    if (modal.success || force) setOpenEdit(false);
  };

  const handleUpdateFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const updateVendor = async (e: React.FormEvent) => {
    // prevent auto refresh of page
    e.preventDefault();

    // upon submitting, turn "touched" status to true for all fields
    setTouched({
      businessName: true,
      description: true,
      email: true,
      facebook: true,
      instagram: true,
      store: true,
    })

    // validate the form inputs first
    if (!validate()) {
      setModal({ 
        open: true, 
        title: 'Form Errors', 
        message: 'Please fix the errors in the form before submitting.', 
        success: false 
      });
      return;
    }

    try {
      await axios.patch(`/api/vendor/${user?.id}`, fields, {
        withCredentials: true,
      });
      await getVendor();

      // open success modal;
      setModal({ open: true, title: 'Success', message: 'Your vendor profile was updated', success: true });
    } catch (err: any) {
      console.error("Error updating vendor:", err);

      // determine the error message to display
      let errMessage = err.response.data;
      if (errMessage.message && errMessage.message.original) {
        if (errMessage.message.original.code === 'ER_DATA_TOO_LONG') {
          // handle errors for overly-long data
          errMessage = `Too long of an input was given for the ${errMessage.message.original.sqlMessage.split("'")[1]} field`;
        } else if (errMessage.message.original.code === 'ER_DUP_ENTRY') {
          // handle errors for duplicate unique vendor properties
          const errMsgRef = errMessage.message.original.sqlMessage.split("vendors.");
          let fieldRef: keyof typeof fields = errMsgRef[errMsgRef.length - 1];
          fieldRef = fieldRef.slice(0, fieldRef.length - 1) as keyof typeof fields;
          errMessage = `Another vendor already was given ${fields[fieldRef]} for the ${fieldRef} field`;
          setErrors((prev) => ({
            ...prev,
            [fieldRef]: "More than one vendor cannot have the same value for this field",
          }));
        } else {
          // handle any other less common database-related errors
          errMessage = `Uncommon database error: ${errMessage.message.original.sqlMessage}`
        }
      } else if (typeof errMessage.message === "string") {
        // cover 404 errors
        errMessage = errMessage.message;
      }

      // open failure modal
      setModal({ open: true, title: 'Error', message: `Failed to submit vendor changes, please ensure there are no unresolved errors left in the form: ${String(errMessage)}`, success: false });
    }
  };

  const deleteVendor = async () => {
    if (vendor) {
      try {
        //possible TODO: make more efficient if possible
        // delete associated image
        await deleteUploadedImage();
        // delete all uploaded images associated with vendor
        await axios.delete(`/api/images/vendorId/${vendor.id}`, { withCredentials: true });
        // delete vendor
        await axios.delete(`/api/vendor/${user?.id}`, { withCredentials: true });
        // update vendor status in user state
        await getUser();
        // close modal
        setOpenDelete(false);
      } catch (err) {
        console.error("Error deleting vendor record: ", err);
      }
    } else {
      console.error("No vendor to delete");
    }
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
                  // TODO: possibly delete avatar?
                    src={vendor.profilePicture || uploadedImage?.referenceURL}
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
                    <Tooltip title="Change Profile Image (max size 5MB)">
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
            <EditVendor open={openEdit} onClose={handleModalClose} vendor={vendor} fields={fields} touched={touched} errors={errors} handleUpdateFieldChange={handleUpdateFieldChange} handleBlur={handleBlur} updateVendor={updateVendor}/>

            {/* Success/Error Modal */}
            <Dialog 
              open={modal.open} 
              onClose={() => { handleModalClose(false) }}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  minWidth: '400px'
                }
              }}
            >
              <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                color: modal.success ? 'success.main' : 'error.main'
              }}>
                {modal.success ? (
                  <CheckCircle color="success" fontSize="large" />
                ) : (
                  <Error color="error" fontSize="large" />
                )}
                {modal.title}
              </DialogTitle>
              
              <DialogContent>
                <DialogContentText>
                  {modal.message}
                </DialogContentText>
              </DialogContent>
              
              <DialogActions sx={{ p: 2 }}>
                <StyledButton
                  onClick={() => { handleModalClose(false) }}
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: modal.success ? 'success.main' : 'error.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: modal.success ? 'success.dark' : 'error.dark',
                    }
                  }}
                >
                  {modal.success ? 'View Vendor Profile' : 'Got It'}
                </StyledButton>
              </DialogActions>
            </Dialog>

            {/* delete */}
            <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
              <Box
                sx={{
                  backgroundColor: "white",
                  p: 4,
                  borderRadius: 2,
                  maxWidth: 400,
                  mx: "auto",
                  my: "20vh",
                  textAlign: "center",
                  boxShadow: 24,
                }}
              >
                <Typography variant="h6" mb={2}>
                  Are you sure you want to delete your vendor account?
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#b71c1c",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#fbe9e7",
                        borderColor: "#b71c1c",
                        color: "#b71c1c",
                      },
                    }}
                    onClick={() => {
                      deleteVendor();
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenDelete(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
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
