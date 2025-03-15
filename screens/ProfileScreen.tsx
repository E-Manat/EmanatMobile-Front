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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {launchCamera} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); 
  const [isEdited, setIsEdited] = useState(false);

  const navigation = useNavigation();

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

  const loadProfileData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('profileData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setPhone(parsedData.phone);
        setEmail(parsedData.email);
        setAddress(parsedData.address);
        setProfileImage(parsedData.profileImage);
      }
    } catch (error) {
      console.log('Məlumat oxuma xətası:', error);
    }
  };

  const openCamera = () => {
    const options = {
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
        const imageUri = response.assets?.[0]?.uri;
        if (imageUri) {
          setProfileImage(imageUri);
          setIsEdited(true); // Şəkil dəyişəndə yadda saxla düyməsi görünsün
        }
      }
    });
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="chevron-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Profil</Text>
              <View style={{width: 24}} />
            </View>

            <View style={styles.profileContainer}>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={styles.imageContainer}>
                  <Image
                    source={
                      profileImage
                        ? {uri: profileImage}
                        : require('../assets/img/user.png')
                    }
                    style={styles.profileImage}
                  />
                </View>{' '}
                <TouchableOpacity
                  style={styles.cameraIcon}
                  onPress={openCamera}>
                  <Icon name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>

              <Text style={styles.profileName}>Ali Aliyev</Text>
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
                      : require('../assets/img/user.png')
                  }
                  style={styles.modalImage}
                />
              </TouchableOpacity>
            </Modal>

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
                <Icon name="edit-2" size={20} color="gray" />
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
                <Icon name="edit-2" size={20} color="gray" />
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
                <Icon name="edit-2" size={20} color="gray" />
              </View>
            </View>

            {isEdited && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProfileData}>
                <Text style={styles.saveButtonText}>Yadda saxla</Text>
              </TouchableOpacity>
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
    borderRadius: 10,
  },
});
