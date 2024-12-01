// components/GoogleMapComponent.tsx
import React from 'react';
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';

interface Props {
  currentLocation: {
    lat: number;
    lng: number;
  };
  startLocation: google.maps.LatLngLiteral;
  endLocation: google.maps.LatLngLiteral;
}

const containerStyle = {
  width: '100%',
  height: '330px',
};

const GoogleMapComponent: React.FC<Props> = ({
  currentLocation,
  startLocation,
  endLocation,
}) => {
  const center = {
    lat: currentLocation.lat,
    lng: currentLocation.lng,
  };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyA1hbmUTv5XBgn9k9-q0JG0L5kGMEl-bdE',
  });

  // Hooks must be called unconditionally
  const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = React.useState<string>('');

  // Memoize the icon
  const icon = React.useMemo(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return {
        url: '/Car-Icon.png',
        scaledSize: new window.google.maps.Size(100, 100),
      };
    }
    return null;
  }, [isLoaded]);

  // Calculate directions
  React.useEffect(() => {
    if (isLoaded && startLocation && endLocation) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: startLocation,
          destination: endLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            setDirections(result);

            // Extract distance from result
            const route = result.routes[0];
            if (route && route.legs[0]) {
              setDistance(route.legs[0].distance?.text || '');
            }
          } else {
            console.error(`Error fetching directions ${result}`);
          }
        }
      );
    }
  }, [isLoaded, startLocation, endLocation]);

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15} // Adjust the zoom level as desired
    >
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            preserveViewport: true, // Prevents the map from auto-adjusting
          }}
        />
      )}
      <Marker position={center} icon={icon || undefined} />
    </GoogleMap>
  );
};

export default React.memo(GoogleMapComponent);
