import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomModal from '../components/Modal';
import {LockIcon} from '../assets/icons';
import {Routes} from '@navigation/routes';
import {SvgImage} from '@components/SvgImage';
import {MainStackParamList} from 'types/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

const {width, height} = Dimensions.get('window');

const PinSetupScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.pinSetup>
> = ({navigation}) => {
  const insets = useSafeAreaInsets();
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
            navigation.replace(Routes.mainTabs);
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
              navigation.replace(Routes.mainTabs);
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
    <View style={[styles.container]}>
      {isConfirming && (
        <TouchableOpacity
          style={[styles.backButton, {top: +insets.top}]}
          onPress={handleGoBack}>
          <SvgImage
            color={'#28303F'}
            source={require('assets/icons/svg/go-back.svg')}
          />
          <Text style={styles.backButtonText}>Sıfırla</Text>
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Image
          source={require('../assets/img/tick.png')}
          style={styles.image}
        />
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
                onPress={() => handlePress(num)}
                activeOpacity={0.7}>
                <Text style={styles.numText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.row}>
            {['4', '5', '6'].map(num => (
              <TouchableOpacity
                key={num}
                style={styles.numButton}
                onPress={() => handlePress(num)}
                activeOpacity={0.7}>
                <Text style={styles.numText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.row}>
            {['7', '8', '9'].map(num => (
              <TouchableOpacity
                key={num}
                style={styles.numButton}
                onPress={() => handlePress(num)}
                activeOpacity={0.7}>
                <Text style={styles.numText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.row}>
            <View style={styles.numButtonPlaceholder} />
            <TouchableOpacity
              style={styles.numButton}
              onPress={() => handlePress('0')}
              activeOpacity={0.7}>
              <Text style={styles.numText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}>
              <Text style={styles.numText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {storedPin && (
          <TouchableOpacity
            onPress={handleForgotPin}
            style={styles.forgotPinButton}>
            <LockIcon color="#989898" />
            <Text style={styles.forgotPinText}>PIN kodu unutmusunuz?</Text>
          </TouchableOpacity>
        )}
      </View>

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

const buttonSize = Math.min(width * 0.18, 70);
const circleSize = width * 0.045;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: width * 0.045,
    fontWeight: '700',
    marginVertical: height * 0.02,
    color: '#5D5D5D',
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
  },
  pinDisplay: {
    flexDirection: 'row',
    marginBottom: height * 0.04,
    gap: width * 0.03,
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    borderWidth: 1.5,
    borderColor: '#1269B5',
  },
  filledCircle: {
    backgroundColor: '#1269B5',
  },
  numberPad: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.1,
  },
  numButton: {
    width: buttonSize,
    height: buttonSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: buttonSize / 2,
    borderColor: '#2D64AF',
    backgroundColor: '#fff',
  },
  deleteButton: {
    width: buttonSize,
    height: buttonSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: {
    fontSize: width * 0.06,
    color: '#5D5D5D',
    fontWeight: '600',
  },
  image: {
    height: width * 0.25,
    width: width * 0.25,
    resizeMode: 'contain',
  },
  numButtonPlaceholder: {
    width: buttonSize,
    height: buttonSize,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: width * 0.038,
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
    color: '#28303F',
  },
  forgotPinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: height * 0.025,
    padding: 10,
  },
  forgotPinText: {
    fontSize: width * 0.032,
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
    color: '#5D5D5D',
  },
});

export default PinSetupScreen;
