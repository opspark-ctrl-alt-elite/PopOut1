import React, { useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
  InfoWindow
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 29.9511,
  lng: -90.0715,
};

const libraries: ("places")[] = ["places"];

const Map: React.FC = () => {
  const [selected, setSelected] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // nearby events
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
    <div>
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
        <input
          type="text"
          placeholder="Search..."
          style={{
            width: "240px",
            height: "32px",
            padding: "0 12px",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        />
      </Autocomplete>

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
        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#666" }}>
          Category: {activeEvent.category}
        </p>
      </div>
    </InfoWindow>
  )}
</GoogleMap>
    </div>
  );
};

export default Map;
