import React, {useEffect} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({navigation}: any) => {
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userPin = await AsyncStorage.getItem('userPin');
        if (userPin) {
          navigation.replace('PinSetup');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.log('AsyncStorage xətası:', error);
        navigation.replace('Login');
      }
    };

    checkUser();
  }, [navigation]);

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
