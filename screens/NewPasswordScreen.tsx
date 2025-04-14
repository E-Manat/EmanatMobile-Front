import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import axios from 'axios';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {RootStackParamList} from '../App';
import CustomModal from '../components/Modal';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const NewPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: '',
    description: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
    onCancel: () => setModalVisible(false),
  });

  const navigation = useNavigation<NavigationProp>();
  const route: any = useRoute();
  const {email} = route.params || {};

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

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        'https://emanat-api.siesco.studio/auth/Auth/ConfirmPassword',
        {
          email: email,
          newPassword: password,
          confirmNewPassword: confirmPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        showModal('Uğurlu', 'Şifrə yeniləndi', 'Davam et', () => {
          setModalVisible(false);
          navigation.navigate('Login');
        });
      } else {
        showModal(
          'Xəta',
          'Şifrə yenilənmədi. Zəhmət olmasa, yenidən cəhd edin.',
          'Bağla',
          () => setModalVisible(false),
        );
      }
    } catch (error) {
      showModal(
        'Xəta',
        'Bir xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.',
        'Bağla',
        () => setModalVisible(false),
      );
    } finally {
      setLoading(false);
    }
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
        placeholder="Yeni şifrə"
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Təsdiqlə</Text>
        )}
      </TouchableOpacity>

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
    color: '#424242',
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
    marginBottom: 15,
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
    fontFamily: 'DMSans-Regular',
  },
  button: {
    backgroundColor: '#1269B5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontSize: 16, fontFamily: 'DMSans-Regular'},
});

export default NewPasswordScreen;
