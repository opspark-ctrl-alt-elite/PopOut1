import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Stack,
  Alert,
} from "@mui/material";
import axios from "axios";
import { Info } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: Function;
  vendor: {
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
  } | null;
  setVendor: (vendor: any) => void;
  fields: {
    businessName?: string;
    email?: string;
    description?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  touched: {
    businessName?: boolean;
    email?: boolean;
    description?: boolean;
    website?: boolean;
    instagram?: boolean;
    facebook?: boolean;
  };
  errors: {
    businessName?: string;
    email?: string;
    description?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  handleUpdateFieldChange: Function;
  handleBlur: Function;
  updateVendor: Function;
};

const EditVendor: React.FC<Props> = ({ open, onClose, vendor, setVendor, fields, touched, errors, handleUpdateFieldChange, handleBlur, updateVendor }) => {

  return (
    <Modal open={open} onClose={() => {onClose(true)}}>
      <Box
        component="form"
        onSubmit={(e) => { updateVendor(e) }}
        sx={{
          backgroundColor: "white",
          width: 400,
          maxHeight: "80vh",
          overflowY: "auto",
          mx: "auto",
          my: "10vh",
          borderRadius: 2,
          p: 4,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Edit Vendor Profile
        </Typography>

        <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
          Fields marked with * are required. All vendors are subject to review.
        </Alert>

        <Stack alignItems="center" mb={2}>
          <Avatar src={vendor && vendor.profilePicture ? vendor.profilePicture : ""} sx={{ width: 100, height: 100 }} />
        </Stack>

        <TextField
          required
          margin="normal"
          name="businessName"
          label="Business Name "
          value={fields.businessName}
          onChange={(e) => { handleUpdateFieldChange(e) }}
          onBlur={() => handleBlur('businessName')}
          error={touched.businessName && !!errors.businessName}
          helperText={
            ((touched.businessName && errors.businessName) || `${fields.businessName.length}/50 characters`)
          }
          fullWidth
        />

        <TextField
          required
          margin="normal"
          name="description"
          label="Business Description "
          value={fields.description}
          onChange={(e) => { handleUpdateFieldChange(e) }}
          onBlur={() => handleBlur('description')}
          error={touched.description && !!errors.description}
          helperText={
            ((touched.description && errors.description) || `${fields.description.length}/300 characters`)
          }
          fullWidth
          multiline
          rows={4}
          inputProps={{
            maxLength: 300
          }}
        />

        <TextField
          required
          margin="normal"
          name="email"
          label="Business Email "
          value={fields.email}
          onChange={(e) => { handleUpdateFieldChange(e) }}
          onBlur={() => handleBlur('email')}
          error={touched.email && !!errors.email}
          helperText={touched.email && errors.email}
          fullWidth
        />

        {/* <Button
          variant="outlined"
          component="label"
          fullWidth
          disabled={uploading}
          sx={{ mb: 2, backgroundColor: "black", color: "white" }}
        >
          {uploading ? "Uploading..." : "Upload Profile Picture"}
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </Button> */}

        <Typography variant="subtitle1" mt={2} mb={1}>
          Connections
        </Typography>

        <TextField
          margin="normal"
          name="facebook"
          label="Facebook Account URL"
          value={fields.facebook}
          onChange={(e) => { handleUpdateFieldChange(e) }}
          onBlur={() => handleBlur('facebook')}
          error={touched.facebook && !!errors.facebook}
          helperText={touched.facebook && errors.facebook}
          fullWidth
        />

        <TextField
          margin="normal"
          name="instagram"
          label="Instagram Account URL"
          value={fields.instagram}
          onChange={(e) => { handleUpdateFieldChange(e) }}
          onBlur={() => handleBlur('instagram')}
          error={touched.instagram && !!errors.instagram}
          helperText={touched.instagram && errors.instagram}
          fullWidth
        />

        <TextField
          margin="normal"
          name="website"
          label="Online Store URL"
          value={fields.website}
          onChange={(e) => { handleUpdateFieldChange(e) }}
          onBlur={() => handleBlur('website')}
          error={touched.website && !!errors.website}
          helperText={touched.website && errors.website}
          fullWidth
        />

        <Stack direction="row" justifyContent="space-between" mt={3}>
          <Button
            type="submit"
            sx={{
              backgroundColor: "black",
              color: "white",
              px: 3,
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            Confirm
          </Button>

          <Button
            type="button"
            onClick={() => {onClose(true)}}
            sx={{
              backgroundColor: "black",
              color: "white",
              px: 3,
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

// lime bean
export default EditVendor;