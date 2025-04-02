import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [focusedInput, setFocusedInput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://192.168.10.119:5206/auth/Auth/Login';

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email || !password) {
      Alert.alert('Xəta', 'Zəhmət olmasa bütün sahələri doldurun!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        API_URL,
        {email, password},
        {headers: {'Content-Type': 'application/json'}},
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('userToken', response.data.accessToken);
        navigation.navigate('PinSetup');
      } else {
        Alert.alert('Xəta', 'Gözlənilməz bir problem baş verdi!');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setEmailError('Email və ya şifrə yanlışdır!');
        setPasswordError('Email və ya şifrə yanlışdır!');
        Alert.alert('Xəta', 'Daxil edilən məlumatlarda səhv var!');
      } else {
        Alert.alert('Şəbəkə xətası', 'İnternet bağlantınızı yoxlayın!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daxil ol</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, email və şifrənizi daxil edin
      </Text>

      {/* Email input */}
      <View
        style={[
          styles.inputContainer,
          focusedInput === 'email' && {borderColor: '#1269B5'},
          emailError && {borderColor: '#EF5350'},
        ]}>
        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />
        <Icon name="mail" size={20} color="#aaa" />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Şifrə input */}
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Daxil ol</Text>
        )}
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
  title: {fontSize: 36, fontWeight: '600', color: '#001D45', marginBottom: 10},
  subtitle: {fontSize: 12, color: '#5D5D5D', marginBottom: 30},
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
  input: {flex: 1, fontSize: 16, color: '#9E9E9E', backgroundColor: '#F6F6F6'},
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
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  errorText: {color: '#EF5350', fontSize: 12, marginVertical: 5},
});

export default LoginScreen;
