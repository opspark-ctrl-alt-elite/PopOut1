import React, { useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 29.9511,
  lng: -90.0715,
};

const libraries: "places"[] = ["places"];

const Map: React.FC = () => {
  const [selected, setSelected] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

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
        {selected && <Marker position={center} />}
      </GoogleMap>
    </div>
  );
};

export default Map;
