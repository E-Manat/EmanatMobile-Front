import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const OtpScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleChange = (text: any, index: any) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };
  return (
    <View style={styles.container}>
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
    backgroundColor: '#fff',
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
});

export default OtpScreen;
