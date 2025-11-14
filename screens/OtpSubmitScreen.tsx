import {CommonActions, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import CustomModal from '../components/Modal';
import {apiService} from '../services/apiService';
import {API_ENDPOINTS} from '../services/api_endpoint';
import {SvgImage} from '@components/SvgImage';
import {AuthStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OtpInput} from '../components/OtpInput';

interface ModalProps {
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
}

const OtpSubmit: React.FC<
  NativeStackScreenProps<AuthStackParamList, Routes.otpSubmit>
> = ({navigation}) => {
  const route = useRoute<any>();
  const email = route.params?.email;

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [modalVisible, setModalVisible] = useState(false);
  const [modalProps, setModalProps] = useState<ModalProps>({
    title: '',
    description: '',
    confirmText: '',
    onConfirm: () => {},
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const finalOtp = otp.join('');

    if (finalOtp.length !== 6) {
      return;
    }

    setIsLoading(true);
    try {
      await apiService.postWithoutAuth(API_ENDPOINTS.auth.confirmOtp, {
        email,
        otp: finalOtp,
      });
      setModalProps({
        title: 'Uğurlu',
        description: 'OTP təsdiqləndi.',
        confirmText: 'Davam et',
        onConfirm: () => {
          setModalVisible(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: Routes.newPassword,
                  params: {email},
                },
              ],
            }),
          );
        },
      });
    } catch {
      setModalProps({
        title: 'Xəta',
        description: 'OTP doğru deyil.',
        confirmText: 'Bağla',
        onConfirm: () => setModalVisible(false),
      });
    } finally {
      setIsLoading(false);
      setModalVisible(true);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await apiService.postWithoutAuth(API_ENDPOINTS.auth.sendEmail, {email});
      setModalProps({
        title: 'Göndərildi',
        description: `${email} ünvanına yeni OTP göndərildi.`,
        confirmText: 'Bağla',
        onConfirm: () => setModalVisible(false),
      });
    } catch {
      setModalProps({
        title: 'Xəta',
        description: 'OTP göndərilə bilmədi.',
        confirmText: 'Bağla',
        onConfirm: () => setModalVisible(false),
      });
    } finally {
      setIsLoading(false);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <SvgImage
          color="#28303F"
          source={require('assets/icons/svg/go-back.svg')}
        />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>OTP təsdiqlə</Text>
      <Text style={styles.subtitle}>
        Zəhmət olmasa, email vasitəsilə ilə göndərilmiş 6 rəqəmli şifrəni daxil
        edin
      </Text>

      <OtpInput length={6} value={otp} onChange={setOtp} />

      {isLoading ? (
        <ActivityIndicator size="small" color="#1269B5" style={styles.loader} />
      ) : (
        <Text style={styles.resendLink} onPress={handleResendOtp}>
          Yenidən göndər
        </Text>
      )}

      <TouchableOpacity style={styles.verifyButton} onPress={handleSubmit}>
        <Text style={styles.verifyButtonText}>Təsdiqlə</Text>
      </TouchableOpacity>

      <Text style={styles.resendText}>6-rəqəmli kod əldə etmisinizmi?</Text>

      <CustomModal {...modalProps} visible={modalVisible} />
    </View>
  );
};

export default OtpSubmit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  backButton: {
    marginTop: 30,
    position: 'absolute',
    left: 15,
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'DMSans-Regular',
  },
  title: {
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 36,
    fontWeight: '500',
    paddingTop: 100,
    lineHeight: 46.8,
  },
  subtitle: {
    color: '#424242',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  verifyButton: {
    backgroundColor: '#1269B5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
  resendText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#616161',
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
  },
  resendLink: {
    color: '#1269B5',
    fontWeight: '600',
    fontFamily: 'DMSans-SemiBold',
    marginBottom: 15,
    alignSelf: 'flex-end',
  },
  loader: {
    marginBottom: 15,
    alignSelf: 'flex-end',
  },
});
