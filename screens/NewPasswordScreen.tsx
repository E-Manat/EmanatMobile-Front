import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import CustomModal from '../components/Modal';
import {useRoute} from '@react-navigation/native';
import {apiService} from '../services/apiService';
import {API_ENDPOINTS} from '../services/api_endpoint';
import {AuthStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SvgImage} from '@components/SvgImage';

const NewPasswordScreen: React.FC<
  NativeStackScreenProps<AuthStackParamList, Routes.newPassword>
> = ({navigation}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [modalInfo, setModalInfo] = useState({
    title: '',
    description: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
    onCancel: () => setModalVisible(false),
  });

  const route: any = useRoute();
  const {email} = route.params || {};

  useEffect(() => {
    setPasswordValidation({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const showModal = (
    title: string,
    description: string,
    confirmText: string,
    onConfirm: () => void,
    cancelText?: string,
    onCancel?: () => void,
  ) => {
    setModalInfo({
      title,
      description,
      confirmText,
      cancelText: cancelText || '',
      onConfirm,
      onCancel: onCancel || (() => setModalVisible(false)),
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      showModal('Xəta', 'Şifrələr uyğun gəlmir', 'Bağla', () =>
        setModalVisible(false),
      );
      return;
    }

    const isValidPassword = Object.values(passwordValidation).every(v => v);
    if (!isValidPassword) {
      showModal('Xəta', 'Şifrə tələblərə uyğun deyil', 'Bağla', () =>
        setModalVisible(false),
      );
      return;
    }

    setLoading(true);
    try {
      await apiService.postWithoutAuth(API_ENDPOINTS.auth.confirmPassword, {
        email,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });

      showModal('Uğurlu', 'Şifrə yeniləndi', 'Davam et', () => {
        setModalVisible(false);
        navigation.navigate(Routes.login);
      });
    } catch {
      showModal(
        'Xəta',
        'Şifrə yenilənmədi. Zəhmət olmasa, yenidən cəhd edin.',
        'Bağla',
        () => setModalVisible(false),
      );
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({
    isValid,
    text,
  }: {
    isValid: boolean;
    text: string;
  }) => (
    <View style={styles.validationItem}>
      <Text
        style={[
          styles.validationBullet,
          isValid && styles.validationBulletActive,
        ]}>
        •
      </Text>
      <Text
        style={[styles.validationText, isValid && styles.validationTextActive]}>
        {text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni şifrənin təyini</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, təhlükəsizliyiniz üçün yeni bir şifrə yaradın və yadda
        saxladığınıza əmin olun
      </Text>

      <Text style={styles.label}>Yeni şifrə</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          placeholder="Yeni şifrə"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}>
          <SvgImage
            source={
              showPassword
                ? require('assets/icons/svg/open-eye.svg')
                : require('assets/icons/svg/closed-eye.svg')
            }
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Yeni şifrə təkrar</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showConfirmPassword}
          placeholder="Yeni şifrə təkrar"
          placeholderTextColor="#bbb"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <SvgImage
            source={
              showConfirmPassword
                ? require('assets/icons/svg/open-eye.svg')
                : require('assets/icons/svg/closed-eye.svg')
            }
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Təsdiqlə</Text>
        )}
      </TouchableOpacity>
      <View style={styles.validationContainer}>
        <Text style={styles.validationTitle}>Şifrə tələbləri:</Text>
        <ValidationItem
          isValid={passwordValidation.hasMinLength}
          text="Ən azı 8 simvol"
        />
        <ValidationItem
          isValid={passwordValidation.hasUpperCase}
          text="Ən azı 1 böyük hərf"
        />
        <ValidationItem
          isValid={passwordValidation.hasLowerCase}
          text="Ən azı 1 kiçik hərf"
        />
        <ValidationItem
          isValid={passwordValidation.hasNumber}
          text="Ən azı 1 rəqəm"
        />
        <ValidationItem
          isValid={passwordValidation.hasSpecialChar}
          text="Ən azı 1 xüsusi simvol (!@#$%)"
        />
      </View>

      <CustomModal
        visible={modalVisible}
        title={modalInfo.title}
        description={modalInfo.description}
        confirmText={modalInfo.confirmText}
        cancelText={modalInfo.cancelText}
        onConfirm={modalInfo.onConfirm}
        onCancel={modalInfo.onCancel}
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
    paddingTop: 115,
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
  validationContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  validationTitle: {
    color: '#424242',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 12,
    marginBottom: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  validationBullet: {
    color: '#bbb',
    fontSize: 20,
    marginRight: 8,
  },
  validationBulletActive: {
    color: '#4CAF50',
  },
  validationText: {
    color: '#bbb',
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  validationTextActive: {
    color: '#4CAF50',
  },
  label: {
    color: '#424242',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 12,
    fontStyle: 'normal',
    lineHeight: 18,
    marginTop: 10,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 22,
  },
  input: {
    height: 52,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    borderColor: '#FEF5E7',
    borderRadius: 8,
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
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
});

export default NewPasswordScreen;
