import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import CustomModal from '../components/Modal';
import {LockIcon} from '../assets/icons';
import Icon from 'react-native-vector-icons/Feather';
type NavigationProp = StackNavigationProp<RootStackParamList, 'PinSetup'>;

const PinSetupScreen = () => {
  const [pin, setPin] = useState<string>('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');

  useEffect(() => {
    const fetchStoredPin = async () => {
      const savedPin = await AsyncStorage.getItem('userPin');
      setStoredPin(savedPin);
    };
    fetchStoredPin();
  }, []);

  const handleForgotPin = async () => {
    await AsyncStorage.setItem('forgotPin', 'true');
    setModalTitle('PIN sıfırlanacaq');
    setModalDescription('Zəhmət olmasa yenidən giriş edin');
    setModalVisible(true);
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
            setModalTitle('PIN təsdiqləndi');
            setModalDescription('Siz uğurla daxil oldunuz!');
            setModalVisible(true);
            await AsyncStorage.setItem('isLoggedIn', 'true');
            navigation.replace('Ana səhifə');
          } else {
            setModalTitle('Xəta');
            setModalDescription('Daxil etdiyiniz PIN yanlışdır!');
            setModalVisible(true);
            setPin('');
          }
        } else {
          await AsyncStorage.setItem('userPin', newPin);
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.removeItem('forgotPin'); // Artıq unudulmadı
          setModalTitle('PIN yaradıldı');
          setModalDescription('Siz uğurla PIN kodu təyin etdiniz!');
          setModalVisible(true);
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={24} color="#2D64AF" />
      </TouchableOpacity>
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
        <View style={styles.row}>
          {['1', '2', '3'].map(num => (
            <TouchableOpacity
              key={num}
              style={styles.numButton}
              onPress={() => handlePress(num)}>
              <Text style={styles.numText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {['4', '5', '6'].map(num => (
            <TouchableOpacity
              key={num}
              style={styles.numButton}
              onPress={() => handlePress(num)}>
              <Text style={styles.numText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {['7', '8', '9'].map(num => (
            <TouchableOpacity
              key={num}
              style={styles.numButton}
              onPress={() => handlePress(num)}>
              <Text style={styles.numText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          <View style={styles.numButtonPlaceholder} />
          <TouchableOpacity
            style={styles.numButton}
            onPress={() => handlePress('0')}>
            <Text style={styles.numText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.numButton, {borderWidth: 0}]}
            onPress={handleDelete}>
            <Text style={styles.numText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleForgotPin}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 10,
          }}>
          <LockIcon color="#989898" />
          <Text style={styles.titlePin}>PIN kodu unutmusunuz?</Text>
        </View>
      </TouchableOpacity>

      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        description={modalDescription}
        confirmText="Bağla"
        onConfirm={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 15,
    color: '#5D5D5D',
    fontFamily: 'DMSans-Regular',
  },
  titlePin: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
    color: '#5D5D5D',
  },
  pinDisplay: {flexDirection: 'row', marginBottom: 10},
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
    gap: 5,
    marginTop: 10,
  },
  numButton: {
    width: 62,
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#2D64AF',
  },
  numText: {fontSize: 24, color: '#5D5D5D'},
  image: {
    height: 100,
    width: 100,
    margin: 0,
    objectFit: 'cover',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },

  numButtonPlaceholder: {
    width: 60,
    height: 60,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 30,
  },
});

export default PinSetupScreen;
