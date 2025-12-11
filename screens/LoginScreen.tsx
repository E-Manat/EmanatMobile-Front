import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomModal from '../components/Modal';
import {AuthStackParamList} from '../types/types';
import {Routes} from '@navigation/routes';
import {SvgImage} from '@components/SvgImage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

const LoginScreen: React.FC<
  NativeStackScreenProps<AuthStackParamList, Routes.login>
> = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [email, setEmail] = useState(__DEV__ ? '' : '');
  const [password, setPassword] = useState(__DEV__ ? '' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [focusedInput, setFocusedInput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    (async () => {
      const remembered = await AsyncStorage.getItem('rememberMe');
      if (remembered === 'true') {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        const savedPassword = await AsyncStorage.getItem('rememberedPassword');
        if (savedEmail) {
          setEmail(savedEmail);
        }
        if (savedPassword) {
          setPassword(savedPassword);
        }
        setRememberMe(true);
      }
    })();
  }, []);

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    console.log('=== LOGIN BAŞLADI ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Remember Me:', rememberMe);

    if (!email || !password) {
      console.log('XƏTA: Boş sahələr');
      setModalTitle('Xəta');
      setModalDescription('Zəhmət olmasa bütün sahələri doldurun!');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      console.log('API çağırışı göndərilir...');
      console.log('URL:', 'https://ekassa-api.e-portal.az/auth/Auth/Login');
      console.log('Request body:', JSON.stringify({email, password}));

      const result: any = await axios.post(
        'https://ekassa-api.e-portal.az/auth/Auth/Login',
        {email, password},
      );

      console.log('API cavabı alındı:', result.status);
      console.log('Response data:', JSON.stringify(result.data, null, 2));

      if (rememberMe) {
        console.log('Məlumatlar yadda saxlanılır...');
        await AsyncStorage.multiSet([
          ['rememberMe', 'true'],
          ['rememberedEmail', email],
          ['rememberedPassword', password],
        ]);
      } else {
        console.log('Yadda saxlanmış məlumatlar silinir...');
        await AsyncStorage.multiRemove([
          'rememberMe',
          'rememberedEmail',
          'rememberedPassword',
        ]);
      }

      console.log('Token və user məlumatları saxlanılır...');
      await AsyncStorage.multiSet([
        ['userToken', result.data.accessToken],
        ['refreshToken', result.data.refreshToken],
        ['userId', result.data.userId],
        ['expiresAt', result.data.expires],
        ['isLoggedIn', 'true'],
      ]);
      await AsyncStorage.setItem('roleName', result.data.roleName);

      console.log('Naviqasiya edilir...');
      navigation.replace(Routes.main as any, {screen: Routes.pinSetup} as any);
      console.log('=== LOGIN UĞURLU ===');
    } catch (error: any) {
      console.log('=== LOGIN XƏTASI ===');
      console.log('Error full:', error);
      console.log('Error response:', error?.response);
      console.log('Error status:', error?.response?.status);
      console.log('Error data:', error?.response?.data);
      console.log('Error message:', error?.message);

      setModalTitle('Xəta');
      setModalDescription(
        error?.response?.status === 400
          ? 'Email və ya şifrə yanlışdır.'
          : `Şəbəkə xətası: ${error?.message || 'Naməlum xəta'}`,
      );
      setModalVisible(true);
    } finally {
      setLoading(false);
      console.log('=== LOGIN PROSESI TAMAMLANDI ===');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
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
          <SvgImage source={require('assets/icons/svg/call.svg')} />
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
            <SvgImage
              source={
                showPassword
                  ? require('assets/icons/svg/open-eye.svg')
                  : require('assets/icons/svg/closed-eye.svg')
              }
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.rememberRow}
          onPress={() => setRememberMe(prev => !prev)}
          activeOpacity={0.8}>
          <SvgImage
            source={
              rememberMe
                ? require('assets/icons/svg/checkbox-checked.svg')
                : require('assets/icons/svg/checkbox-unchecked.svg')
            }
          />
          <Text style={styles.rememberText}>Məni xatırla</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate(Routes.forgotPassword)}>
          <Text style={styles.forgotPassword}>Şifrəni unutmusuz?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Daxil olun</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        description={modalDescription}
        confirmText="Bağla"
        onConfirm={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 40,
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
    color: '#424242',
    fontFamily: 'DMSans-Regular',
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  rememberText: {
    color: '#424242',
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
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
