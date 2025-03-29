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

type User = {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
};

type Props = {
  // user: User
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

const libraries: ("places")[] = ["places"];

const Map: React.FC<Props> = ({ user }) => {
  const [selected, setSelected] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  useEffect(() => {
    if (!selected) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelected({ lat: latitude, lng: longitude });
        },
        (error) => console.warn(error)
      );
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
      {/* HEADER */}
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
          {/* LOGO */}
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
          </Stack>

          {/* PROFILE PIC */}
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton component={Link} to="/userprofile">
              <Avatar
                src={user?.profile_picture}
                alt={user?.name || "User"}
              />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* MAP */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selected || center}
        zoom={12}
      >
        {events.map((event, i) => (
          <Marker
            key={i}
            position={{ lat: event.latitude, lng: event.longitude }}
            title={event.title}
            onClick={() => setActiveEvent(event)}
          />
        ))}
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
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                Category: {activeEvent.category}
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
