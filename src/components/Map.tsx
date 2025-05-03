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
import { Link, useLocation } from "react-router-dom";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PlaceIcon from "@mui/icons-material/Place";
import RefreshIcon from "@mui/icons-material/Refresh";

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

const defaultCenter = {
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

const categoryColors: { [key: string]: string } = {
  "Food & Drink": "#FB8C00",
  Art: "#8E24AA",
  Music: "#E53935",
  "Sports & Fitness": "#43A047",
  Hobbies: "#FDD835",
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
  const [mapCenter, setMapCenter] =
    useState<google.maps.LatLngLiteral>(defaultCenter);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedLat = parseFloat(queryParams.get("lat") || "");
  const selectedLng = parseFloat(queryParams.get("lng") || "");
  const hasSelectedCoords = !isNaN(selectedLat) && !isNaN(selectedLng);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // map center
  useEffect(() => {
    if (hasSelectedCoords) {
      setMapCenter({ lat: selectedLat, lng: selectedLng });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc = { lat: latitude, lng: longitude };
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (error) => {
          console.warn("Geolocation error", error);
          setMapCenter(defaultCenter);
        }
      );
    }
  }, [hasSelectedCoords, selectedLat, selectedLng]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/map/events`);
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching popups", err);
      }
    };

    fetchEvents();
  }, []);

  // useEffect(() => {
  //   if (!selected) return;

  //   // const fetchEvents = async () => {
  //   //   try {
  //   //     const res = await fetch(
  //   //       /map/events/nearby?lat=${selected.lat}&lng=${selected.lng}
  //   //     );
  //   //     const data = await res.json();
  //   //     setEvents(data);
  //   //   } catch (err) {
  //   //     console.error("err fetching nearby events", err);
  //   //   }
  //   // };

  //   const fetchEvents = async () => {
  //     try {
  //       const res = await fetch(
  //         ${window.location.origin}/api/map/events/nearby?lat=${selected.lat}&lng=${selected.lng}
  //       );
  //       const data = await res.json();
  //       setEvents(data);
  //     } catch (err) {
  //       console.error("err fetching nearby events", err);
  //     }
  //   };

  //   fetchEvents();
  // }, [selected]);

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
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Autocomplete
              onLoad={(autocomplete) =>
                (autocompleteRef.current = autocomplete)
              }
              onPlaceChanged={() => {
                const place = autocompleteRef.current?.getPlace();
                const location = place?.geometry?.location;
                if (location) {
                  setMapCenter({ lat: location.lat(), lng: location.lng() });
                }
              }}
            >
              <InputBase
                placeholder="Search..."
                sx={{
                  px: 2,
                  py: 0.5,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  width: { xs: 150, sm: 200, md: 250 },
                }}
              />
            </Autocomplete>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ ml: 2 }}
            >
              {[
                "Food & Drink",
                "Art",
                "Music",
                "Sports & Fitness",
                "Hobbies",
              ].map((cat) => (
                <IconButton
                  key={cat}
                  size="medium"
                  onClick={() =>
                    setActiveCategory((prev) => (prev === cat ? null : cat))
                  }
                  sx={{
                    bgcolor: categoryColors[cat],
                    color: "#fff",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    transform:
                      activeCategory === cat ? "scale(1.25)" : "scale(1)",
                    boxShadow:
                      activeCategory === cat ? "0 0 0 2px white" : "none",
                    "&:hover": {
                      bgcolor: categoryColors[cat],
                      color: "#fff",
                    },
                  }}
                >
                  {React.cloneElement(getCategoryIcon(cat), {
                    fontSize: "medium",
                  })}
                </IconButton>
              ))}

              {activeCategory && (
                <IconButton
                  size="small"
                  onClick={() => setActiveCategory(null)}
                  sx={{
                    border: "1px solid #ccc",
                    bgcolor: "#f0f0f0",
                    "&:hover": {
                      bgcolor: "#e0e0e0",
                    },
                  }}
                  title="Show all categories"
                >
                  <RefreshIcon />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
      >
        {/* markers */}
        {events
          .filter((event) => {
            const category = event.category_name || event.Categories?.[0]?.name;
            return !activeCategory || category === activeCategory;
          })
          .map((event, i) => {
            const category =
              event.category_name || event.Categories?.[0]?.name || "Unknown";
            return (
              <Marker
                key={i}
                position={{ lat: event.latitude, lng: event.longitude }}
                title={event.title}
                onClick={() => setActiveEvent(event)}
                icon={{ url: getMarkerIcon(category) }}
              />
            );
          })}

        {/* user */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}

        {/* info window */}
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
                {getCategoryIcon(
                  activeEvent.category_name ||
                    activeEvent.Categories?.[0]?.name ||
                    "Unknown"
                )}{" "}
                {activeEvent.category_name ||
                  activeEvent.Categories?.[0]?.name ||
                  "Unknown"}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </Box>
  );
};

export default Map;
