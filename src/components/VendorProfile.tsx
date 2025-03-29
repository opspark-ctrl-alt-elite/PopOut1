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
    businessName: '',
    email: '',
    profilePicture: '',
    description: '',
    website: '',
    instagram: '',
    facebook: ''
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
      setVendor( vendorObj.data );
    } catch (err) {
      // error handling
      // set the vendor in state to null
      // ADVISE: MAY REPLACE WITH SIMPLY RETURNING NULL FROM HTTP HANDLER
      setVendor(null);
      console.error("Error retrieving vendor record: ", err);
    }
  }

  // alters the current user's vendor record with changes from the fields in state
  const updateVendor = async () => {
    try {
      // trim off any field values that are empty strings
      const trimmedFields = {};
      const keys: string[] = Object.keys(fields);
      for (let i = 0; i < keys.length; i++) {
        if (fields[keys[i]] !== '') {
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
  }

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
  }

  const handleUpdateFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };









  console.log(vendor);
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };





  


  return (
    <div>
      <Grid2 container spacing={2}>
        <Grid2 size={3}>
          <Button onClick={() => { setOpenEdit(true) }}>
            Edit profile
          </Button>
            <Modal open={openEdit}>
              <Box sx={style}>
                <Typography variant="h6" component="h2">
                  Edit Vendor Profile
                </Typography>
                <TextField
                  name="businessName"
                  label="Name of Business"
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
                  label="Profile Picture link (will eventually be upload)"
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
                  label="Website Link"
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
                <Button onClick={() => {updateVendor(); setOpenEdit(false) }} variant="outlined" sx={{ color: 'red', outlineColor: 'red' }}>
                  Confirm
                </Button>
                <Button onClick={() => { setOpenEdit(false) }} variant="outlined">
                  Cancel
                </Button>
              </Box>
            </Modal>
        </Grid2>
        <Grid2 size={6}>
          <Typography>
            PUT MAIN DIV HERE EVeNTUALLY
          </Typography>
        </Grid2>
        <Grid2 size={3}>
          <Button>
            do nothing button hobo =)
          </Button>
        </Grid2>
      </Grid2>
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
                  <Link to="/">
                    <Button variant="outlined" sx={{ display:"flex", justifyContent: 'center', alignContent: 'center' , height: '10vh', width: '50vh'}}>
                      View User Profile
                    </Button>
                  </Link>
                  <Button onClick={() => { setOpenDelete(true) }} variant="outlined" sx={{ display:"flex", justifyContent: 'center', alignContent: 'center' , height: '10vh', width: '50vh', color: 'red', outlineColor: 'red' }}>
                    Delete
                  </Button>
                  <Modal open={openDelete}>
                    <Box sx={style}>
                      <Typography variant="h6" component="h2">
                        Are you sure?
                      </Typography>
                      <Button onClick={() => {deleteVendor(); setOpenDelete(false) }} variant="outlined" sx={{ color: 'red', outlineColor: 'red' }}>
                        Yes
                      </Button>
                      <Button onClick={() => { setOpenDelete(false) }} variant="outlined">
                        No
                      </Button>
                    </Box>
                  </Modal>
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
