import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Image, Alert, Linking, AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkAndForceLocation} from '../utils/locationPermissionHandler';
import CustomModal from '../components/Modal';
import axios from 'axios';
import Config from 'react-native-config';
import {getVersion} from 'react-native-device-info';

const SplashScreen = ({navigation}: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newVersionCode, setNewVersionCode] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    const init = async () => {
      const gpsAllowed = await checkAndForceLocation();
      console.log(gpsAllowed, 'gps');
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

    init();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active') {
          const gpsAllowed = await checkAndForceLocation();
          if (gpsAllowed) {
            setModalVisible(false);
            navigation.replace('SplashScreen'); // Eyni səhifəni yenidən yüklə
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
        <Image
          source={require('../assets/img/splashImage.png')}
          style={styles.emanatImage}
        />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1269B5',
    width: '100%',
  },
  emanatImage: {
    width: '60%',
    resizeMode: 'contain',
  },
});

export default SplashScreen;
