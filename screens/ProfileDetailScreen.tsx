import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import TopHeader from '../components/TopHeader';
import {useNavigation} from '@react-navigation/native';
import {apiService} from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {API_ENDPOINTS} from '../services/api_endpoint';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Profil'>;
const ProfileDetailScreen = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
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

      const result: any = await apiService.get(API_ENDPOINTS.auth.getProfile);
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
  return (
    <>
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
            {/* <Text style={styles.profileRoleName}>Inkassator</Text> */}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Əlaqə nömrəsi</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="Nömrə" value={phone} />
            {/* <Icon name="edit-2" size={20} color="gray" /> */}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="Email" value={email} />
            {/* <Icon name="edit-2" size={20} color="gray" /> */}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ünvan</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ünvan"
              value={address}
            />
            {/* <Icon name="edit-2" size={20} color="gray" /> */}
          </View>
        </View>
      </View>
    </>
  );
};

export default ProfileDetailScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  label: {
    color: '#9E9E9E',
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  input: {
    flex: 1,
    color: '#212121',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
  },
  profileContainer: {
    width: '100%',
    alignItems: 'center',
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
  profileName: {
    color: '#063A66',
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 24, // 150% of 16px
  },
});
