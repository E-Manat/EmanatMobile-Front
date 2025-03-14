import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/AntDesign';
import {PermissionsAndroid} from 'react-native';

const Location = () => {
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        requestLocation();
      } else {
        setLoading(false);
        setLocation('Lokasiya icazəsi verilmədi');
      }
    } else {
      requestLocation();
    }
  };

  const requestLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        await getAddressFromCoordinates(latitude, longitude);
      },
      error => {
        setLoading(false);
        console.log(error);
        setLocation('Ünvan tapılmadı');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const getAddressFromCoordinates = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      );
      const data = await response.json();
      if (data.display_name) {
        console.log(data, 'data');
        setLocation(data.display_name);
      } else {
        setLocation('Ünvan tapılmadı');
      }
    } catch (error) {
      console.error(error);
      setLocation('Ünvan tapılmadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.heading}>Ünvan</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.paragraph}>{location}</Text>
          )}
        </View>
        {/* <Text style={styles.paragraph}>
          Zivər bəy Əhmədbəyov, Bakı, Yasamal
        </Text> */}
        {/* <Icon name="arrowright" size={24} color="#000" /> */}
      </View>
    </View>
  );
};

export default Location;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    color: '#001D45',
    fontSize: 16,
    fontWeight: '600',
  },
  paragraph: {
    color: '#A8A8A8',
    fontSize: 14,
    fontWeight: '400',
  },
});
