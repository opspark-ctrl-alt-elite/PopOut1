import React, { useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
  InfoWindow,
} from "@react-google-maps/api";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  InputBase,
} from "@mui/material";
import { Link } from "react-router-dom";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PlaceIcon from "@mui/icons-material/Place";

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Props = {
  user: User | null;
};

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 64px)",
};

const center = {
  lat: 29.9511,
  lng: -90.0715,
};

const libraries: "places"[] = ["places"];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Food & Drink":
      return <RestaurantIcon fontSize="small" />;
    case "Art":
      return <BrushIcon fontSize="small" />;
    case "Music":
      return <MusicNoteIcon fontSize="small" />;
    case "Sports & Fitness":
      return <SportsHandballIcon fontSize="small" />;
    case "Hobbies":
      return <EmojiEmotionsIcon fontSize="small" />;
    default:
      return <PlaceIcon fontSize="small" />;
  }
};

const getMarkerIcon = (category: string) => {
  switch (category?.trim()) {
    case "Food & Drink":
      return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    case "Art":
      return "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
    case "Music":
      return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    case "Sports & Fitness":
      return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    case "Hobbies":
      return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    default:
      return "http://maps.google.com/mapfiles/ms/icons/gray-dot.png";
  }
};

const Map: React.FC<Props> = ({ user }) => {
  const [selected, setSelected] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  useEffect(() => {
    if (!selected) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setSelected({ lat: latitude, lng: longitude });
      });
    }
  }, []);

  useEffect(() => {
    if (!selected) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `/map/events/nearby?lat=${selected.lat}&lng=${selected.lng}`
        );
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("err fetching nearby events", err);
      }
    };

    fetchEvents();
  }, [selected]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: "#fff", color: "#000" }}>
        <Toolbar
          sx={{
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography
              component={Link}
              to="/"
              variant="h5"
              fontWeight="bold"
              sx={{ textDecoration: "none", color: "inherit" }}
            >
              PopOut
            </Typography>

            <Autocomplete
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={() => {
                const place = autocompleteRef.current?.getPlace();
                const location = place?.geometry?.location;
                if (location) {
                  setSelected({ lat: location.lat(), lng: location.lng() });
                }
              }}
            >
              <InputBase
                placeholder="Search by location..."
                sx={{
                  px: 2,
                  py: 0.5,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  width: 250,
                }}
              />
            </Autocomplete>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
              {["Food & Drink", "Art", "Music", "Sports & Fitness", "Hobbies"].map((cat) => (
                <IconButton
                  key={cat}
                  size="small"
                  onClick={() =>
                    setActiveCategory((prev) => (prev === cat ? null : cat))
                  }
                  sx={{
                    bgcolor: activeCategory === cat ? "#1976d2" : "#f0f0f0",
                    color: activeCategory === cat ? "#fff" : "#000",
                    border: "1px solid #ccc",
                    "&:hover": {
                      bgcolor: activeCategory === cat ? "#1565c0" : "#e0e0e0",
                    },
                  }}
                >
                  {getCategoryIcon(cat)}
                </IconButton>
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton component={Link} to="/userprofile">
              <Avatar src={user?.profile_picture} alt={user?.name || "User"} />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selected || center}
        zoom={12}
      >
        {events
          .filter((event) => !activeCategory || event.category_name === activeCategory)
          .map((event, i) => {
            const category = event.category_name || "Unknown";
            return (
              <Marker
                key={i}
                position={{ lat: event.latitude, lng: event.longitude }}
                title={event.title}
                onClick={() => setActiveEvent(event)}
                icon={{
                  url: getMarkerIcon(category),
                }}
              />
            );
          })}

        {activeEvent && (
          <InfoWindow
            position={{
              lat: activeEvent.latitude,
              lng: activeEvent.longitude,
            }}
            onCloseClick={() => setActiveEvent(null)}
          >
            <div style={{ maxWidth: "200px" }}>
              <h4 style={{ margin: "0 0 4px" }}>{activeEvent.title}</h4>
              <p style={{ margin: 0 }}>{activeEvent.venue_name}</p>
              <p style={{ margin: 0 }}>{activeEvent.description}</p>
              <p style={{ margin: 0 }}>
                {new Date(activeEvent.startDate).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.85rem",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {getCategoryIcon(activeEvent.category_name)}{" "}
                {activeEvent.category_name}
              </p>
            </div>
          </InfoWindow>
        )}

        {selected && (
          <Marker
            position={selected}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}
      </GoogleMap>
    </Box>
  );
};

export default Map;
