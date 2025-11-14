import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';

const OtpScreen: React.FC<
  NativeStackScreenProps<AuthStackParamList, Routes.otp>
> = ({navigation, route}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const handleChange = (text: any, index: any) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={24} color="red" />
      </TouchableOpacity>
      <Text style={styles.title}>OTP təsdiqlə</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, Mail vasitəsilə ilə göndərilmiş 6 rəqəmli şifrəni daxil
        edin
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Təsdiqlə</Text>
      </TouchableOpacity>

      <Text style={styles.resendText}>
        6-rəqəmli kod əldə etmisiniz?
        <Text style={styles.resendLink}>Yenidən göndər</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'red',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f4f4f4',
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  resendLink: {
    color: '#007aff',
    fontWeight: '500',
  },
  backButton: {
    marginTop: 30,
    position: 'absolute',
    left: 15,
  },
});

export default OtpScreen;
