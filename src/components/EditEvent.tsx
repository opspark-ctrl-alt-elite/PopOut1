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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const libraries: "places"[] = ["places"];

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [form, setForm] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Modal state for notifications
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    success: boolean;
  }>({ open: false, title: "", message: "", success: false });

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
            message: "Event not found",
            success: false,
          });
          return;
        }

        setForm({
          ...event,
          location: "",
          categories: event.categories?.map((c: any) => c.name) || [],
        });
        setAvailableCategories(categoriesRes.data.map((cat: any) => cat.name));
      } catch (err) {
        console.error("Failed to fetch event or categories:", err);
        setModal({
          open: true,
          title: "Error",
          message: "Failed to load event data",
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

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };
      await axios.put(`/api/events/${id}`, payload, { withCredentials: true });
      setModal({ open: true, title: "Success", message: "Event updated!", success: true });
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: "Error", message: "Error updating event.", success: false });
    }
  };

  const handleModalClose = () => {
    setModal((prev) => ({ ...prev, open: false }));
    if (modal.success) {
      navigate("/active-events");
    }
  };

  // Google Maps API render
  if (!isLoaded) return <div>Loading...</div>;
  if (!form) return <Typography>Loading...</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Edit Event</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
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
            label="Description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
          />

          {/* Updated Start Date using DateTimePicker */}
          <DateTimePicker
            label="Start Date *"
            value={form.startDate ? new Date(form.startDate) : null}
            onChange={(newValue) =>
              setForm((prev: any) => ({
                ...prev,
                startDate: newValue ? newValue.toISOString() : "",
              }))
            }
            inputFormat="MM/dd/yyyy hh:mm aa"
            ampm
            onError={() => null}
            renderInput={(params) => (
              <TextField {...params} fullWidth error={!!errors.startDate} helperText={errors.startDate} />
            )}
          />

          {/* Updated End Date using DateTimePicker */}
          <DateTimePicker
            label="End Date *"
            value={form.endDate ? new Date(form.endDate) : null}
            onChange={(newValue) =>
              setForm((prev: any) => ({
                ...prev,
                endDate: newValue ? newValue.toISOString() : "",
              }))
            }
            inputFormat="MM/dd/yyyy hh:mm aa"
            ampm
            onError={() => null}
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

          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
          >
            <TextField
              label="Location *"
              value={form.location}
              onChange={handleChange}
              name="location"
              error={!!errors.location}
              helperText={errors.location || "Start typing address..."}
              fullWidth
            />
          </Autocomplete>

          <TextField
            name="image_url"
            label="Image URL (optional)"
            value={form.image_url}
            onChange={handleChange}
            fullWidth
          />

          <FormControlLabel
            control={<Checkbox name="isFree" checked={form.isFree} onChange={handleChange} />}
            label="Free?"
          />
          <FormControlLabel
            control={<Checkbox name="isKidFriendly" checked={form.isKidFriendly} onChange={handleChange} />}
            label="Kid-Friendly?"
          />
          <FormControlLabel
            control={<Checkbox name="isSober" checked={form.isSober} onChange={handleChange} />}
            label="Sober?"
          />

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

          <Button variant="contained" onClick={handleSubmit}>
            Update
          </Button>
        </Stack>

        {/* Non-blocking Modal Notification */}
        <Dialog
          open={modal.open}
          onClose={handleModalClose}
          hideBackdrop
          disableEnforceFocus
          aria-labelledby="notification-dialog-title"
          aria-describedby="notification-dialog-description"
        >
          <DialogTitle id="notification-dialog-title">{modal.title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="notification-dialog-description">
              {modal.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default EditEvent;
