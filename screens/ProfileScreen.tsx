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

  const saveProfileData = async () => {
    try {
      const profileData = {phone, email, address, profileImage};
      await AsyncStorage.setItem('profileData', JSON.stringify(profileData));

      setIsEdited(false);

      Toast.show({
        type: 'success',
        text1: 'Şəxsi məlumatlar yenilənib',
        visibilityTime: 3000,
        autoHide: true,
        position: 'top',
      });
    } catch (error) {
      console.log('Yadda saxlama xətası:', error);
    }
  };

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

  const openCamera = () => {
    const options: any = {
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: true,
    };
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('İstifadəçi kameranı bağladı');
      } else if (response.errorCode) {
        console.log('Kamera xətası:', response.errorMessage);
      } else {
        const imageUri: any = response.assets?.[0]?.uri;
        if (imageUri) {
          setProfileImage(imageUri);
          setIsEdited(true); // Şəkil dəyişəndə yadda saxla düyməsi görünsün
        }
      }
    });
  };

  const handleLogout = async () => {
    console.log('Çıxış prosesi başladı...');

    Alert.alert(
      'Çıxış',
      'Sistemdən çıxmaq istədiyinizə əminsiniz?',
      [
        {text: 'Xeyr', style: 'cancel'},
        {
          text: 'Bəli',
          onPress: async () => {
            console.log('İstifadəçi çıxışı təsdiqlədi');

            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('isLoggedIn');

              console.log('AsyncStorage təmizləndi');
              navigation.replace('Login');
            } catch (error) {
              console.log('Çıxış zamanı xəta:', error);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.container}>
            <TopHeader
              title="Profil"
              rightIconName="log-out"
              onRightPress={handleLogout}
            />

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
                </View>{' '}
                <TouchableOpacity
                  style={styles.cameraIcon}
                  // onPress={openCamera}
                >
                  <Icon name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>

              <Text style={styles.profileName}>
                <Text style={styles.profileName}>
                  {firstName.toUpperCase()} {lastName.toUpperCase()}
                </Text>
              </Text>
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

            {loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="large" color="#2D64AF" />
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Əlaqə nömrəsi</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={text => {
                        setPhone(text);
                        setIsEdited(true);
                      }}
                      placeholder="Əlaqə nömrəsi"
                    />
                    {/* <Icon name="edit-2" size={20} color="gray" /> */}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={text => {
                        setEmail(text);
                        setIsEdited(true);
                      }}
                      placeholder="Email"
                    />
                    {/* <Icon name="edit-2" size={20} color="gray" /> */}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Ünvan</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={address}
                      onChangeText={text => {
                        setAddress(text);
                        setIsEdited(true);
                      }}
                      placeholder="Ünvan"
                    />
                    {/* <Icon name="edit-2" size={20} color="gray" /> */}
                  </View>
                </View>

                {isEdited && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveProfileData}>
                    <Text style={styles.saveButtonText}>Yadda saxla</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

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
    width: 110,
    height: 110,
    borderRadius: 50,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
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
});
