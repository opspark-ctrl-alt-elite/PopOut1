import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  FormGroup,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const libraries: ("places")[] = ["places"];

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [form, setForm] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    success: false,
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const [eventRes, categoriesRes] = await Promise.all([
          axios.get("/api/events", { withCredentials: true }),
          axios.get("/api/categories"),
        ]);
        const event = eventRes.data.find((e: any) => e.id === id);
        if (!event) {
          setModal({
            open: true,
            title: "Error",
            message: "Popup not found",
            success: false,
          });
          return;
        }
        setForm({
          ...event,
          location: event.location || "",
          categories: event.categories?.map((c: any) => c.name) || [],
          image_publicId: event.image_publicId || "",
        });
        setAvailableCategories(categoriesRes.data.map((cat: any) => cat.name));
      } catch (err) {
        console.error("Failed to fetch popup or categories:", err);
        setModal({
          open: true,
          title: "Error",
          message: "Failed to load popup data",
          success: false,
        });
      }
    };
    fetchEvent();
  }, [id]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.title) newErrors.title = "Title is required";
    if (!form.description) newErrors.description = "Description is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (!form.venue_name) newErrors.venue_name = "Venue is required";
    if (!form.location) newErrors.location = "Location is required";
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setForm((prev: any) => {
      const alreadySelected = prev.categories.includes(category);
      return {
        ...prev,
        categories: alreadySelected
          ? prev.categories.filter((c: string) => c !== category)
          : [...prev.categories, category],
      };
    });
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (place && location) {
      setForm((prev: any) => ({
        ...prev,
        location: place.formatted_address || "",
        latitude: location.lat().toString(),
        longitude: location.lng().toString(),
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imageUpload", file);

    try {
      const endpoint = form.image_publicId
        ? `/api/images/${form.image_publicId}`
        : `/api/images/event/${id}`;
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadResult = Array.isArray(response.data) ? response.data[0] : response.data;
      setForm((prev: any) => ({
        ...prev,
        image_url: uploadResult.secure_url || uploadResult.url,
        image_publicId: uploadResult.public_id || prev.image_publicId,
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  const handleDeleteImage = async () => {
    if (!form.image_publicId) return;
    try {
      await axios.delete("/api/images", {
        data: { publicIds: [form.image_publicId] },
      });
      setForm((prev: any) => ({
        ...prev,
        image_url: "",
        image_publicId: "",
      }));
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };
      await axios.put(`/api/events/${id}`, payload, { withCredentials: true });
      setModal({ open: true, title: "Success", message: "Popup updated!", success: true });
    } catch (err) {
      console.error("Error updating popup:", err);
      setModal({ open: true, title: "Error", message: "Error updating popup.", success: false });
    }
  };

  const handleModalClose = () => {
    setModal((prev: any) => ({ ...prev, open: false }));
    if (modal.success) navigate("/active-events");
  };

  if (!isLoaded || !form) return <Typography>Loading...</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Edit Popup</Typography>
        <Stack spacing={3}>
          <TextField
            name="title"
            label="Title *"
            value={form.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
          />

          <TextField
            name="description"
            label="Description *"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />

          <DateTimePicker
            label="Start Date *"
            value={form.startDate ? new Date(form.startDate) : null}
            onChange={(newValue) =>
              setForm((prev: any) => ({
                ...prev,
                startDate: newValue ? newValue.toISOString() : "",
              }))
            }
            renderInput={(params) => (
              <TextField {...params} fullWidth error={!!errors.startDate} helperText={errors.startDate} />
            )}
          />

          <DateTimePicker
            label="End Date *"
            value={form.endDate ? new Date(form.endDate) : null}
            onChange={(newValue) =>
              setForm((prev: any) => ({
                ...prev,
                endDate: newValue ? newValue.toISOString() : "",
              }))
            }
            renderInput={(params) => (
              <TextField {...params} fullWidth error={!!errors.endDate} helperText={errors.endDate} />
            )}
          />

          <TextField
            name="venue_name"
            label="Venue *"
            value={form.venue_name}
            onChange={handleChange}
            error={!!errors.venue_name}
            helperText={errors.venue_name}
            fullWidth
          />

          <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={handlePlaceChanged}>
            <TextField
              label="Location *"
              name="location"
              value={form.location}
              onChange={handleChange}
              error={!!errors.location}
              helperText={errors.location || "Type to search..."}
              fullWidth
            />
          </Autocomplete>

          <Box>
            <Button
              variant="contained"
              size="small"
              component="label"
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: 1,
                backgroundColor: "#000",
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              {form.image_url ? "Replace Image" : "Upload Image"}
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>
            {form.image_url && (
              <>
                <Box mt={2}>
                  <img
                    src={form.image_url}
                    alt="Popup"
                    style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
                  />
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={handleDeleteImage}
                  sx={{ mt: 2, borderRadius: 2, textTransform: "none", boxShadow: 1 }}
                >
                  Delete Image
                </Button>
              </>
            )}
          </Box>

          <FormGroup row>
            <FormControlLabel control={<Checkbox name="isFree" checked={form.isFree} onChange={handleChange} />} label="Free" />
            <FormControlLabel control={<Checkbox name="isKidFriendly" checked={form.isKidFriendly} onChange={handleChange} />} label="Kid-Friendly" />
            <FormControlLabel control={<Checkbox name="isSober" checked={form.isSober} onChange={handleChange} />} label="Sober" />
          </FormGroup>

          {availableCategories.length > 0 && (
            <>
              <FormLabel component="legend">Categories</FormLabel>
              <FormGroup row>
                {availableCategories.map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={form.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                      />
                    }
                    label={category}
                  />
                ))}
              </FormGroup>
            </>
          )}

          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: 1,
              backgroundColor: "#000",
              color: "#fff",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            Update Popup
          </Button>
        </Stack>

        <Dialog open={modal.open} onClose={handleModalClose}>
          <DialogTitle>{modal.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{modal.message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleModalClose}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                boxShadow: 1,
                backgroundColor: "#000",
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default EditEvent;
