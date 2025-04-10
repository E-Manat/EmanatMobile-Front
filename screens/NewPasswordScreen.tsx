import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const NewPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      Alert.alert('Xəta', 'Şifrələr uyğun gəlmir');
      return;
    }

    // Yeni şifrəni göndərmək və ya yadda saxlamaq üçün backend request
    console.log('Yeni şifrə:', password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni şifrənin təyini</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, təhlükəsizliyiniz üçün yeni bir şifrə yaradın və yadda
        saxladığınıza əmin olun
      </Text>

      <Text style={styles.label}>Yeni şifrə</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="yeni şifrə"
        placeholderTextColor="#bbb"
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Yeni şifrə təkrar</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Yeni şifrə təkrar"
        placeholderTextColor="#bbb"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Daxil ol</Text>
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
    marginBottom: 24,
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

export default NewPasswordScreen;
