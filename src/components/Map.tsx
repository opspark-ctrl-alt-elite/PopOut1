import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 29.9511,
  lng: -90.0715,
};

const Map: React.FC = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      <Marker position={center} />
    </GoogleMap>
  );
};

export default Map;
