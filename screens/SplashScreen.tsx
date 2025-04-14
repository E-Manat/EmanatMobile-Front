import React, {useEffect} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkAndForceLocation} from '../utils/locationPermissionHandler';

const SplashScreen = ({navigation}: any) => {
  useEffect(() => {
    // checkAndForceLocation();

    const checkUser = async () => {
      try {
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
      } catch (error) {
        console.log('AsyncStorage xətası:', error);
      }
    };

    checkUser();
  }, [navigation]);

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
    <View style={styles.container}>
      <Image
        source={require('../assets/img/splashImage.png')}
        style={styles.emanatImage}
      />
    </View>
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
