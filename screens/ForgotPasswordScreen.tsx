import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');

  const handleSendOtp = () => {
    // OTP göndərmə funksiyası buraya yazılır
    console.log('OTP göndərildi:', email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Şifrəni unutdum</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, şifrəni yeniləyə bilmək üçün Email daxil edin
      </Text>

      <Text style={styles.label}>E-poçt ünvanı</Text>
      <TextInput
        style={styles.input}
        placeholder="namesurname@gmail.com"
        placeholderTextColor="#bbb"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
        <Text style={styles.buttonText}>OTP göndər</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
