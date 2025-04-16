import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {launchCamera} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {apiService} from '../services/apiService';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import TopHeader from '../components/TopHeader';
import {OutIcon, SecurityIcon, UserIcon} from '../assets/icons';
import CustomModal from '../components/Modal';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Profil'>;

const ProfileScreen = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadProfileData();
  }, []);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const loadProfileData = async () => {
    try {
      setLoading(true);

      const result: any = await apiService.get('/auth/Auth/GetProfile');
      console.log('Profil məlumatları:', result);

      if (result) {
        setFirstName(result.firstName || 'Ad yoxdur');
        setLastName(result.lastName || 'Soyad yoxdur');
        setPhone(result.phone || 'N/A');
        setEmail(result.email || 'example@example.com');
        setAddress(result.address || 'Ünvan daxil edilməyib');
        setProfileImage(result.profileImage || null);

        const profileData = {
          firstName: result.firstName || 'Ad yoxdur',
          lastName: result.lastName || 'Soyad yoxdur',
          phone: result.phone || 'N/A',
          email: result.email || 'example@example.com',
          address: result.address || 'Ünvan daxil edilməyib',
          profileImage: result.profileImage || null,
        };

        await AsyncStorage.setItem('profileData', JSON.stringify(profileData));
        setLoading(false);
      } else {
        console.log('API-dən uğursuz cavab:', result);
      }
    } catch (error) {
      console.log('Məlumat yükləmə xətası:', error);
    }
  };

  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('isLoggedIn');
      navigation.replace('Login');
    } catch (error) {
      console.log('Çıxış zamanı xəta:', error);
    }
  };

  const [logoutConfirmModalVisible, setLogoutConfirmModalVisible] =
    useState(false);

  return (
    <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.container}>
            <TopHeader title="Profil" />

            <View style={styles.profileContainer}>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={styles.imageContainer}>
                  <Image
                    source={
                      profileImage
                        ? {uri: profileImage}
                        : require('../assets/img/default.jpg')
                    }
                    style={styles.profileImage}
                  />
                </View>
              </TouchableOpacity>
              <View>
                <Text style={styles.profileName}>
                  {firstName} {lastName}
                </Text>
                <Text style={styles.profileRoleName}>Inkassator</Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('ProfileDetail')}>
                <View style={styles.iconBox}>
                  <UserIcon color="#1269B5" />
                </View>
                <Text style={styles.text}>Profil məlumatları</Text>
                <Icon
                  name="chevron-right"
                  size={20}
                  color="#98A2B3"
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.itemContainer}>
                <View style={styles.iconBox}>
                  <SecurityIcon color="#1269B5" />
                </View>
                <Text style={styles.text}>Təhlükəsizlik</Text>
                <Icon
                  name="chevron-right"
                  size={20}
                  color="#98A2B3"
                  style={styles.arrowIcon}
                />
              </TouchableOpacity> */}

              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => setLogoutConfirmModalVisible(true)}>
                <View style={styles.iconBox}>
                  <OutIcon color="#1269B5" />
                </View>
                <Text style={styles.text}>Çıxış</Text>
                <Icon
                  name="chevron-right"
                  size={20}
                  color="#98A2B3"
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            </View>
            <Modal
              visible={modalVisible}
              transparent={true}
              animationType="fade">
              <TouchableOpacity
                style={styles.modalContainer}
                onPress={() => setModalVisible(false)}>
                <Image
                  source={
                    profileImage
                      ? {uri: profileImage}
                      : require('../assets/img/default.jpg')
                  }
                  style={styles.modalImage}
                />
              </TouchableOpacity>
            </Modal>

            <CustomModal
              visible={logoutConfirmModalVisible}
              title="Təsdiqləmə"
              description="Sistemdən çıxmaq istədiyinizə əminsiniz?"
              confirmText="Bəli, çıxış et"
              cancelText="Xeyr, ləğv et"
              onConfirm={() => {
                setLogoutConfirmModalVisible(false);
                confirmLogout();
              }}
              onCancel={() => setLogoutConfirmModalVisible(false)}
            />

            <Toast />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    gap: 15,
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#2D64AF',
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 25,
    flexDirection: 'row',
    gap: 10,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  profileRoleName: {
    color: '#9E9E9E',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 10,
    right: -7,
    backgroundColor: '#2D64AF',
    borderRadius: 15,
    padding: 8,
  },
  profileName: {
    color: '#063A66',
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 24,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#1269B5',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 30,
  },
  iconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#EFF8FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  text: {
    color: '#063A66',
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    fontStyle: 'normal',
    flex: 1,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  profileInfo: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
});
