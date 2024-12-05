// components/AnimatedRouteMap.tsx
import React from 'react';
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';

interface Props {
  startLocation: google.maps.LatLngLiteral;
  endLocation: google.maps.LatLngLiteral;
}

const containerStyle = {
  width: '100%',
  height: '330px',
};

const AnimatedRouteMap: React.FC<Props> = ({ startLocation, endLocation }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyA1hbmUTv5XBgn9k9-q0JG0L5kGMEl-bdE',
  });

  // State for directions and distance
  const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = React.useState<string>('');

  // State for animation
  const [markerPosition, setMarkerPosition] = React.useState<google.maps.LatLngLiteral>(startLocation);
  const [animationIndex, setAnimationIndex] = React.useState<number>(0);
  const [animationPath, setAnimationPath] = React.useState<google.maps.LatLngLiteral[]>([]);

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

            // Extract the path points
            const route = result.routes[0];
            if (route && route.legs[0]) {
              setDistance(route.legs[0].distance?.text || '');

              // Flatten the array of steps into a single array of LatLng points
              const pathPoints: google.maps.LatLngLiteral[] = [];
              route.legs[0].steps.forEach((step) => {
                const nextSegment = step.path.map((latLng) => ({
                  lat: latLng.lat(),
                  lng: latLng.lng(),
                }));
                pathPoints.push(...nextSegment);
              });
              setAnimationPath(pathPoints);
              setAnimationIndex(0);
              setMarkerPosition(pathPoints[0]); // Start at the first point
            }
          } else {
            console.error(`Error fetching directions ${result}`);
          }
        }
      );
    }
  }, [isLoaded, startLocation, endLocation]);

  // Animate the marker
  React.useEffect(() => {
    if (animationPath.length > 0 && animationIndex < animationPath.length) {
      const interval = setInterval(() => {
        setMarkerPosition(animationPath[animationIndex]);
        setAnimationIndex((prevIndex) => prevIndex + 1);
      }, 300); // Adjust the interval as needed

      return () => clearInterval(interval);
    }
  }, [animationPath, animationIndex]);

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPosition}
      zoom={17}
    >
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            preserveViewport: true,
          }}
        />
      )}
      <Marker position={markerPosition} icon={icon || undefined} />
    </GoogleMap>
  );
};

export default React.memo(AnimatedRouteMap);
