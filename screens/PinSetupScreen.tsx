import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from '../components/Modal';
import {LockIcon} from '../assets/icons';
import {Routes} from '@navigation/routes';
import {SvgImage} from '@components/SvgImage';
import {MainStackParamList} from 'types/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

const PinSetupScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.pinSetup>
> = ({navigation}) => {
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');

  useEffect(() => {
    const fetchStoredPin = async () => {
      const savedPin = await AsyncStorage.getItem('userPin');
      setStoredPin(savedPin);
      setIsLoading(false);
    };
    fetchStoredPin();
  }, []);

  const handleForgotPin = async () => {
    await AsyncStorage.removeItem('userPin');
    await AsyncStorage.setItem('forgotPin', 'true');
    setModalTitle('PIN sıfırlanacaq');
    setModalDescription('Zəhmət olmasa yenidən giriş edin');
    setModalVisible(true);
  };

  const handlePress = async (num: string) => {
    if (storedPin) {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);

        if (newPin.length === 4) {
          if (newPin === storedPin) {
            await AsyncStorage.setItem('isLoggedIn', 'true');
            navigation.replace(Routes.home);
          } else {
            setModalTitle('Xəta');
            setModalDescription('Daxil etdiyiniz PIN yanlışdır!');
            setModalVisible(true);
            setPin('');
          }
        }
      }
    } else {
      if (!isConfirming) {
        if (pin.length < 4) {
          const newPin = pin + num;
          setPin(newPin);

          if (newPin.length === 4) {
            setIsConfirming(true);
          }
        }
      } else {
        if (confirmPin.length < 4) {
          const newConfirmPin = confirmPin + num;
          setConfirmPin(newConfirmPin);

          if (newConfirmPin.length === 4) {
            if (newConfirmPin === pin) {
              await AsyncStorage.setItem('userPin', pin);
              await AsyncStorage.setItem('isLoggedIn', 'true');
              await AsyncStorage.removeItem('forgotPin');
              navigation.replace(Routes.home);
            } else {
              setModalTitle('Xəta');
              setModalDescription('PIN kodları uyğun gəlmir!');
              setModalVisible(true);
              setPin('');
              setConfirmPin('');
              setIsConfirming(false);
            }
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (!isConfirming) {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleGoBack = () => {
    if (isConfirming) {
      setPin('');
      setConfirmPin('');
      setIsConfirming(false);
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return null;
  }

  const getTitle = () => {
    if (storedPin) {
      return 'PIN daxil edin';
    }
    return isConfirming ? 'PIN təsdiq edin' : '4 rəqəmli PIN təyin edin';
  };

  const currentPin = isConfirming ? confirmPin : pin;

  return (
    <View style={styles.container}>
      {isConfirming && (
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <SvgImage
            color={'#28303F'}
            source={require('assets/icons/svg/go-back.svg')}
          />
          <Text>Sıfırla</Text>
        </TouchableOpacity>
      )}

      <Image source={require('../assets/img/tick.png')} style={styles.image} />
      <Text style={styles.title}>{getTitle()}</Text>
      <View style={styles.pinDisplay}>
        {Array.from({length: 4}).map((_, index) => (
          <View
            key={index}
            style={[styles.circle, currentPin[index] && styles.filledCircle]}
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

      {storedPin && (
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
      )}

      <CustomModal
        visible={modalVisible}
        closeable={false}
        title={modalTitle}
        description={modalDescription}
        confirmText="İrəli"
        onConfirm={() => {
          setModalVisible(false);
          if (modalTitle === 'PIN sıfırlanacaq') {
            navigation.replace(
              Routes.auth as any,
              {screen: Routes.login} as any,
            );
          }
        }}
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
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default PinSetupScreen;
