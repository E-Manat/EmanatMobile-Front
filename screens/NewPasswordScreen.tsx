import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const NewPasswordScreen: React.FC = () => {
  const navigation = useNavigation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

  const handleSavePassword = async () => {
    if (password.length < 6) {
      Alert.alert('Xəta', 'Şifrə ən azı 6 simvol olmalıdır!');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Xəta', 'Şifrələr eyni olmalıdır!');
      return;
    }

    try {
      await AsyncStorage.setItem('userPassword', password);
      Alert.alert('Uğur', 'Şifrə uğurla yaradıldı!', [
        {text: 'OK', onPress: () => navigation.navigate('PinSetup')},
      ]);
    } catch (error) {
      Alert.alert('Xəta', 'Şifrə saxlanarkən problem yarandı.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Şifrəni daxil edin</Text>
      <Text style={styles.subtitle}>Yeni şifrənizi daxil edin</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Şifrə"
          secureTextEntry={secureTextEntry}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
          <Text style={styles.toggleText}>{secureTextEntry ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Şifrəni təsdiqlə"
          secureTextEntry={secureConfirmTextEntry}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}>
          <Text style={styles.toggleText}>
            {secureConfirmTextEntry ? '👁️' : '🙈'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSavePassword}>
        <Text style={styles.primaryButtonText}>Davam et</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryButtonText}>Leğv et</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
  },
  toggleText: {
    fontSize: 18,
    padding: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#E0ECFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewPasswordScreen;
