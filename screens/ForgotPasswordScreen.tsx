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
import CustomModal from '../components/Modal';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const handleSendOtp = async () => {
    if (!email) {
      setModalVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      const userToken = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        'https://emanat-api.siesco.studio/auth/Auth/SendEmail',
        {email},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response) {
        console.log('OTP göndərildi:', email);
        navigation.navigate('OtpSubmit', {email});
      } else {
        console.log('Error', 'OTP göndərilmədi.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    } finally {
      setIsLoading(false); // loading end
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={24} color="#2D64AF" />
      </TouchableOpacity>
      <Text style={styles.title}>Şifrəni unutdum</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, şifrəni yeniləyə bilmək üçün email daxil edin
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOtp}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>OTP göndər</Text>
        )}
      </TouchableOpacity>

      <CustomModal
        visible={modalVisible}
        title="Xəta"
        description="Zəhmət olmasa email ünvanınızı daxil edin"
        confirmText="Tamam"
        onConfirm={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    gap: 10,
    height: '100%',
  },
  title: {
    color: '#063A66', // CSS'deki var(--Primary-primary-800)
    fontFamily: 'DMSans-SemiBold', // DM Sans, Medium ağırlık için genellikle özel font ismi kullanılır
    fontSize: 36,
    lineHeight: 46.8,
    paddingTop: 100,
  },
  subtitle: {
    color: '#424242', // CSS değişkeninin varsayılan değeri
    fontFamily: 'DMSans-Regular', // 400 ağırlık için genellikle Regular
    fontSize: 14,
    fontStyle: 'normal',
    lineHeight: 21,
  },
  label: {
    color: '#424242', // var(--Neutral-800)
    fontFamily: 'DMSans-SemiBold', // 600 ağırlık için genelde bu isim kullanılır
    fontSize: 12,
    fontStyle: 'normal',
    lineHeight: 18,
    marginTop: 10,
  },
  input: {
    height: 52,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    marginBottom: 32,
  },
  button: {
    borderRadius: 8, // var(--s, 8px)
    backgroundColor: '#1269B5', // var(--Primary-500)
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12, // Yalnızca React Native 0.71+ destekliyor, yoksa yerine margin kullan
    height: 52,
    minWidth: 128,
    padding: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular', // 400 ağırlık = Regular
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
  },
  backButton: {
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
