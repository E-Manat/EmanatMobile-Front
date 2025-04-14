import {PermissionsAndroid, Platform, Alert, BackHandler} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Lokasiya İcazəsi',
        message: 'Tətbiqin işləməsi üçün lokasiyanız tələb olunur.',
        buttonNeutral: 'Soruş sonra',
        buttonNegative: 'İmtina et',
        buttonPositive: 'İcazə ver',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    return true;
  }
};

export const checkAndForceLocation = async () => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    Alert.alert(
      'Diqqət',
      'Tətbiq işləmək üçün lokasiya icazəsi tələb edir.',
      [
        {
          text: 'Bağla',
          onPress: () => BackHandler.exitApp(),
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
    return;
  }

  Geolocation.getCurrentPosition(
    position => {
      console.log('Lokasiya tapıldı:', position);
    },
    error => {
      console.log('Lokasiya xətası:', error);

      let message = '';

      switch (error.code) {
        case 1:
          message = 'Lokasiya icazəsi rədd edildi.';
          break;
        case 2:
          message = 'Lokasiya məlumatı mövcud deyil.';
          break;
        case 3:
          message = 'Lokasiya sorğusu zaman aşımına uğradı.';
          break;
        default:
          message = 'Bilinməyən lokasiya xətası baş verdi.';
          break;
      }

      Alert.alert(
        'Lokasiya problemi',
        message + '\nZəhmət olmasa, ayarlardan lokasiyanı aktiv edin.',
        [
          {
            text: 'Bağla',
            onPress: () => BackHandler.exitApp(),
            style: 'destructive',
          },
        ],
        {cancelable: false},
      );
    },
    {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
  );
};
