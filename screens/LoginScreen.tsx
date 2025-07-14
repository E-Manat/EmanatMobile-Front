import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import CustomModal from '../components/Modal';
import {Image} from 'react-native';
import Config from 'react-native-config';

console.log(Config.API_URL, 'jdfnS');
type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [focusedInput, setFocusedInput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = `http://192.168.10.104:5202/api/Auth/Login`;

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email || !password) {
      setModalTitle('Xəta');
      setModalDescription('Zəhmət olmasa bütün sahələri doldurun!');
      setModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        API_URL,
        {email, password},
        {headers: {'Content-Type': 'application/json'}},
      );
      console.log(response);

      if (response) {
        console.log(response, 'response login');
        await AsyncStorage.multiSet([
          ['userToken', response.data.accessToken],
          ['userId', response.data.userId],
          ['expiresAt', response.data.expires],
          ['isLoggedIn', 'true'],
        ]);
        await AsyncStorage.setItem('roleName', response.data.roleName);
        navigation.navigate('PinSetup');
      } else {
        console.log('Xəta', 'Gözlənilməz bir problem baş verdi!');
      }
    } catch (error: any) {
      if (error.response || error.response.status === 401) {
        console.log(error, 'error');
        setModalTitle('Xəta');
        setModalDescription('Daxil edilən məlumatlarda səhv var!');
        setModalVisible(true);
      } else {
        console.log('sebeke xetasi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/img/logo.png')}
        style={styles.profileImage}
      />
      <Text style={styles.title}>Xoş gəlmisiniz!</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, email və şifrənizi daxil edin
      </Text>

      <View
        style={[
          styles.inputContainer,
          focusedInput === 'email' && {borderColor: '#1269B5'},
          emailError && {borderColor: '#EF5350'},
        ]}>
        <TextInput
          placeholder="namesurname@gmail.com"
          style={styles.input}
          keyboardType="email-address"
          placeholderTextColor="#9E9E9E"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />
        <Icon name="mail" size={20} color="#aaa" />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <View
        style={[
          styles.inputContainer,
          focusedInput === 'password' && {borderColor: '#1269B5'},
          passwordError && {borderColor: '#EF5350'},
        ]}>
        <TextInput
          placeholder="********"
          style={styles.input}
          secureTextEntry={!showPassword}
          placeholderTextColor="#9E9E9E"
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

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
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

      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        description={modalDescription}
        confirmText="Bağla"
        onConfirm={() => setModalVisible(false)}
      />
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
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 36,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 46.8,
  },
  subtitle: {
    color: '#424242', // var(--Neutral-800)
    fontFamily: 'DMSans-Regular', // Make sure it's loaded
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginTop: 20,
    paddingVertical: 12,
    borderColor: '#FEF5E7',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#9E9E9E',
    backgroundColor: '#F6F6F6',
    fontFamily: 'DMSans-Regular',
    height: 38,
    paddingRight: 12,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#777',
    fontSize: 14,
    marginVertical: 20,
    fontFamily: 'DMSans-Regular',
  },
  button: {
    backgroundColor: '#1269B5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    height: 48,
  },
  buttonText: {color: '#fff', fontSize: 14, fontFamily: 'DMSans-Regular'},
  errorText: {color: '#EF5350', fontSize: 12, marginVertical: 5},
  profileImage: {
    width: 70,
    height: 70,
    objectFit: 'contain',
    marginBottom: 10,
  },
});

export default LoginScreen;
