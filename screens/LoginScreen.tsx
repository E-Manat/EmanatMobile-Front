import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();

  const [phone, setPhone] = useState<any>('');
  const [password, setPassword] = useState<any>('');
  const [showPassword, setShowPassword] = useState<any>(false);
  const [phoneError, setPhoneError] = useState<any>('');
  const [passwordError, setPasswordError] = useState<any>('');
  const [focusedInput, setFocusedInput] = useState<any>(null);

  const validPhone = '0501234567';
  const validPassword = 'nermin1';

  const handleLogin = () => {
    let isValid = true;

    if (phone !== validPhone) {
      setPhoneError('Telefon nömrəsi yanlışdır!');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (password !== validPassword) {
      setPasswordError('Şifrə yanlışdır!');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (isValid) {
      navigation.navigate('PinSetup');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daxil ol</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, telefon nömrənizi və şifrənizi daxil edin
      </Text>
      <View
        style={[
          styles.inputContainer,
          focusedInput === 'phone' && {borderColor: '#1269B5'},
          phoneError && {borderColor: '#EF5350'},
        ]}>
        <TextInput
          placeholder="Əlaqə nömrəsi"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          onFocus={() => setFocusedInput('phone')}
          onBlur={() => setFocusedInput(null)}
        />
        <Icon name="phone" size={20} color="#aaa" />
      </View>
      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          focusedInput === 'password' && {borderColor: '#1269B5'},
          passwordError && {borderColor: '#EF5350'},
        ]}>
        <TextInput
          placeholder="Şifrə"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusedInput('password')}
          onBlur={() => setFocusedInput(null)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Şifrəni unutmusuz?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Daxil ol</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#001D45',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#5D5D5D',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    marginTop: 20,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#9E9E9E',
    backgroundColor: '#F6F6F6',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#777',
    fontSize: 14,
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#1269B5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF5350',
    fontSize: 12,
    marginVertical: 5,
  },
});

export default LoginScreen;
