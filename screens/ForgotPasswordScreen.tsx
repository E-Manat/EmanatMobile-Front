import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import CustomModal from '../components/Modal';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {apiService} from '../services/apiService';
import {API_ENDPOINTS} from '../services/api_endpoint';
import {AuthStackParamList, MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {SvgImage} from '@components/SvgImage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

const ForgotPasswordScreen: React.FC<
  NativeStackScreenProps<AuthStackParamList, Routes.forgotPassword>
> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      setModalVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await apiService.postWithoutAuth(API_ENDPOINTS.auth.sendEmail, {email});
      navigation.navigate(Routes.otpSubmit, {email});
    } catch (error) {
      console.error('Error sending OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <SvgImage
          color={'#28303F'}
          source={require('assets/icons/svg/go-back.svg')}
        />
        <Text style={styles.backText}>Geri</Text>
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
    position: 'relative',
    paddingTop: 120,
  },
  title: {
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 36,
    lineHeight: 46.8,
  },
  subtitle: {
    color: '#424242',
    fontFamily: 'DMSans-Regular',
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
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    marginBottom: 22,
    borderColor: '#FEF5E7',
    borderRadius: 8,
    borderWidth: 1,
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#1269B5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    height: 48,
    minWidth: 128,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
  },
  backButton: {
    marginTop: 30,
    position: 'absolute',
    left: 15,
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'DMSans-Regular',
  },
});

export default ForgotPasswordScreen;
