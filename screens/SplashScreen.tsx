import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Alert,
  Linking,
  AppState,
  Button,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkAndForceLocation} from '../utils/locationPermissionHandler';
import CustomModal from '../components/Modal';
import {Text} from 'react-native-gesture-handler';

const SplashScreen = ({navigation}: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newVersionCode, setNewVersionCode] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');

  // useEffect(() => {
  //   const init = async () => {
  //     const gpsAllowed = await checkAndForceLocation();
  //     console.log(gpsAllowed, 'gps');
  //     if (!gpsAllowed) {
  //       setModalVisible(true);
  //       return;
  //     }

  //     const userToken = await AsyncStorage.getItem('userToken');
  //     const userPin = await AsyncStorage.getItem('userPin');
  //     const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

  //     if (userToken && userPin && isLoggedIn) {
  //       navigation.replace('Ana səhifə');
  //     } else if (userToken) {
  //       navigation.replace('PinSetup');
  //     } else {
  //       navigation.replace('Login');
  //     }
  //   };

  //   init();
  // }, []);

  const handleStart = async () => {
    const gpsAllowed = await checkAndForceLocation();
    if (!gpsAllowed) {
      setModalVisible(true);
      return;
    }

    const userToken = await AsyncStorage.getItem('userToken');
    const userPin = await AsyncStorage.getItem('userPin');
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

    if (userToken && userPin && isLoggedIn) {
      navigation.replace('Ana səhifə');
    } else if (userToken) {
      navigation.replace('PinSetup');
    } else {
      navigation.replace('Login');
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active') {
          const gpsAllowed = await checkAndForceLocation();
          if (gpsAllowed) {
            setModalVisible(false);
            // navigation.replace('SplashScreen');
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const logAllAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const result = await AsyncStorage.multiGet(keys);
        console.log('AsyncStorage content:');
        result.forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
      }
    };

    logAllAsyncStorage();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.splashContainer}>
          <Image
            source={require('../assets/img/splashImage.png')}
            style={styles.emanatImage}
          />
          <Image
            source={require('../assets/img/inkassator.png')}
            style={styles.splashImage}
          />
          <View style={styles.textBox}>
            <Text style={styles.title}>
              İnkassasiya əməliyyatlarını asanlaşdırın
            </Text>
            <Text style={styles.description}>
              Tapşırıqlarınızı idarə edin, terminalları izləyin və hesabatlara
              nəzarət edin.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Başla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>{' '}
      <CustomModal
        visible={modalVisible}
        title="Diqqət"
        description="Tətbiqin davam etməsi üçün GPS icazəsini verməlisiniz."
        confirmText="İcazə ver"
        onConfirm={() => Linking.openSettings()}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#1269B5',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  splashContainer: {
    width: '88%',
    display: 'flex',
    height: '100%',
    paddingTop: 40,
    position: 'relative',
  },
  emanatImage: {
    width: '50%',
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    position: 'absolute',
    top: 20,
  },
  splashImage: {
    width: '94%',
    height: 450,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 80,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 31.2,
  },
  description: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    marginTop: 10,
  },
  textBox: {
    position: 'absolute',
    bottom: 30,
    left: 0,
  },
  button: {
    display: 'flex',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 8,
    marginTop: 15,
    backgroundColor: '#F99D19',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
  },
});

export default SplashScreen;
