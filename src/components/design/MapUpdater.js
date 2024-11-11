import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

function MapUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], 18, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [latitude, longitude, map]);

  return null;
}

export default MapUpdater;