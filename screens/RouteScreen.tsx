import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const RouteScreen = () => {
  const [region, setRegion] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [destination, setDestination] = useState<any>(null);

  // Gənclik stansiyasının koordinatları
  const destinationCoordinates = {
    latitude: 40.385274,
    longitude: 49.876416,
  };

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });

        setDestination(destinationCoordinates);
        fetchRoute(
          latitude,
          longitude,
          destinationCoordinates.latitude,
          destinationCoordinates.longitude,
        );
      },
      error => {
        console.log('Location error: ', error);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }, []);

  const fetchRoute = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ) => {
    const API_KEY = 'AIzaSyC-nYRKMxy7R24MO_tMPZko9uZYN_ILy7U';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  // Polyline decode funksiyası
  const decodePolyline = (encoded: string) => {
    let index = 0;
    const len = encoded.length;
    const points = [];
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let byte;
      let shift = 0;
      let result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  };

  if (!region || !destination) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={region}>
        <Marker
          coordinate={region}
          title="Your Location"
          description="Current Location"
        />
        <Marker
          coordinate={destination}
          title="Gənclik"
          description="Destination"
        />
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#0000FF"
          strokeWidth={3}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default RouteScreen;
