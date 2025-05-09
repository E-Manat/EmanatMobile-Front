import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {ActivityIndicator} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import CustomModal from '../components/Modal';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

import Config from 'react-native-config';
type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
const OtpSubmit = () => {
  const navigation = useNavigation<NavigationProp>();

  const inputRefs: any = useRef([]);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [modalVisible, setModalVisible] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const route: any = useRoute();
  const email: any = route.params?.email;
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (text: any, index: any) => {
    if (/^[0-9]$/.test(text)) {
      const newOtp: any = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (text === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleSubmit = async () => {
    const finalOtp = otp.join('');
    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${Config.API_URL}/auth/Auth/ConfirmOtp`,
        {email, otp: finalOtp},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      console.log(response);

      if (response?.status === 200) {
        setModalProps({
          visible: true,
          title: 'Uğurlu',
          description: 'OTP təsdiqləndi.',
          confirmText: 'Bağla',
          onConfirm: () => {
            setModalVisible(false);
            navigation.navigate('NewPassword', {email: email});
          },
        });
      } else {
        setModalProps({
          visible: true,
          title: 'Xəta',
          description: 'OTP doğru deyil.',
          confirmText: 'Bağla',
          onConfirm: () => setModalVisible(false),
        });
      }
    } catch (error) {
      setModalProps({
        visible: true,
        title: 'Xəta',
        description: 'Bir xəta baş verdi, zəhmət olmasa yenidən cəhd edin.',
        confirmText: 'Bağla',
        onConfirm: () => setModalVisible(false),
      });
    } finally {
      setIsLoading(false);
      setModalVisible(true);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${Config.API_URL}/auth/Auth/SendEmail`,
        {email},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response) {
        setModalProps({
          visible: true,
          title: 'OTP göndərildi',
          description: `${email} ünvanına OTP göndərildi.`,
          confirmText: 'Bağla',
          onConfirm: () => setModalVisible(false),
        });
      }
    } catch (error) {
      setModalProps({
        visible: true,
        title: 'Xəta',
        description: 'OTP göndərilə bilmədi.',
        confirmText: 'Bağla',
        onConfirm: () => setModalVisible(false),
      });
    } finally {
      setIsLoading(false); // end loading
      setModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={24} color="#2D64AF" />
      </TouchableOpacity>
      <Text style={styles.title}>OTP təsdiqlə</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, email vasitəsilə ilə göndərilmiş 6 rəqəmli şifrəni daxil
        edin
      </Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref): any => (inputRefs.current[index] = ref)}
            style={styles.otpBox}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={text => handleChange(text, index)}
            autoFocus={index === 0}
          />
        ))}
      </View>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color="#1269B5"
          style={{marginLeft: 6}}
        />
      ) : (
        <Text style={styles.resendLink} onPress={handleResendOtp}>
          Yenidən göndər
        </Text>
      )}
      <TouchableOpacity style={styles.verifyButton} onPress={handleSubmit}>
        <Text style={styles.verifyButtonText}>Təsdiqlə</Text>
      </TouchableOpacity>
      <Text style={styles.resendText}>6-rəqəmli kod əldə etmisinizmi? </Text>{' '}
      <CustomModal {...modalProps} visible={modalVisible} />
    </KeyboardAvoidingView>
  );
};

export default OtpSubmit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
    position: 'relative',
  },
  backButton: {
    marginTop: 30,
    position: 'absolute',
    left: 15,
  },
  backText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'DMSans-Regular',
  },
  title: {
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 36,
    fontWeight: '500',
    paddingTop: 100,
    fontStyle: 'normal',
    lineHeight: 46.8,
  },
  subtitle: {
    color: '#424242', // var(--Neutral-800)
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontWeight: '400', // Regular
    fontStyle: 'normal',
    lineHeight: 21,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  otpBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#1269B5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
  resendText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#616161',
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
  },
  resendLink: {
    color: '#1269B5',
    fontWeight: '600',
    fontFamily: 'DMSans-SemiBold',
    marginBottom: 15,
    alignSelf: 'flex-end',
  },
});
