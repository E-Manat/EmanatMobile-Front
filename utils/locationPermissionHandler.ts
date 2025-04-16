import {PermissionsAndroid, Platform, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {Linking, AppState} from 'react-native';

export const checkAndForceLocation = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'GPS İcazəsi',
          message:
            'Tətbiq işləməsi üçün GPS icazəsinə ehtiyac var. Zəhmət olmasa aktiv edin.',
          buttonNeutral: 'Soruş sonra',
          buttonNegative: 'İmtina',
          buttonPositive: 'İcazə ver',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      return new Promise((resolve) => {
        Geolocation.requestAuthorization();
        Geolocation.getCurrentPosition(
          () => resolve(true),
          (error) => {
            Alert.alert(
              'GPS İcazəsi',
              'Tətbiq işləməsi üçün GPS icazəsini aktiv etməlisiniz.',
            );
            resolve(false);
          },
        );
      });
    }
  } catch (error) {
    console.error('GPS icazəsi xətası:', error);
    return false;
  }
};
