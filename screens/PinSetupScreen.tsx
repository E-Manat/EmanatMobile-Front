import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PinSetup'>;

const PinSetupScreen = () => {
  const [pin, setPin] = useState<string>('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchStoredPin = async () => {
      const savedPin = await AsyncStorage.getItem('userPin');
      setStoredPin(savedPin);
    };
    fetchStoredPin();
  }, []);

  const handleForgotPin = async () => {
    await AsyncStorage.setItem('forgotPin', 'true');
    Alert.alert('PIN sıfırlanacaq', 'Zəhmət olmasa yenidən giriş edin');
    navigation.replace('Login');
  };

  const handlePress = async (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        const forgotPin = await AsyncStorage.getItem('forgotPin');

        if (storedPin && forgotPin !== 'true') {
          if (newPin === storedPin) {
            Alert.alert('PIN təsdiqləndi', 'Siz uğurla daxil oldunuz!');
            await AsyncStorage.setItem('isLoggedIn', 'true');
            navigation.replace('Ana səhifə');
          } else {
            Alert.alert('Xəta', 'Daxil etdiyiniz PIN yanlışdır!');
            setPin('');
          }
        } else {
          await AsyncStorage.setItem('userPin', newPin);
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.removeItem('forgotPin'); // Artıq unudulmadı
          Alert.alert('PIN yaradıldı', 'Siz uğurla PIN kodu təyin etdiniz!');
          navigation.replace('Ana səhifə');
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/img/tick.png')} style={styles.image} />
      <Text style={styles.title}>
        {storedPin ? 'PIN daxil edin' : '4 rəqəmli PIN təyin edin'}
      </Text>
      <View style={styles.pinDisplay}>
        {Array.from({length: 4}).map((_, index) => (
          <View
            key={index}
            style={[styles.circle, pin[index] && styles.filledCircle]}
          />
        ))}
      </View>

      <View style={styles.numberPad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(num => (
          <TouchableOpacity
            key={num}
            style={styles.numButton}
            onPress={() => handlePress(num)}>
            <Text style={styles.numText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.numButton} onPress={handleDelete}>
          <Text style={styles.numText}>⌫</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleForgotPin}>
        <Text style={styles.titlePin}>PIN kodu unutmusunuz?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
  },
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#5D5D5D'},
  titlePin: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 20,
    color: '#5D5D5D',
    marginTop: 20,
  },
  pinDisplay: {flexDirection: 'row', marginBottom: 20},
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1269B5',
    margin: 5,
  },
  filledCircle: {backgroundColor: '#1269B5'},
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '60%',
    justifyContent: 'center',
    gap: 15,
  },
  numButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#2D64AF',
  },
  numText: {fontSize: 24, color: '#5D5D5D'},
  image: {
    height: '25%',
    width: '25%',
    objectFit: 'contain',
    margin: 0,
  },
});

export default PinSetupScreen;
