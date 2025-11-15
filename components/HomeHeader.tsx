import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {SvgImage} from './SvgImage';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Ana səhifə'>;
const HomeHeader = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profileImage, setProfileImage] = useState(null);

  const loadProfileData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('profileData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setProfileImage(parsedData.profileImage);
        setFirstName(parsedData.firstName || '');
        setLastName(parsedData.lastName || '');
      }
    } catch (error) {}
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.trim()?.[0]?.toUpperCase() || 'S';
    const last = lastName?.trim()?.[0]?.toUpperCase() || 'A';
    return `${first}${last}`;
  };

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Image
          source={require('../assets/img/emanatFull.png')}
          style={styles.image}
        />
      </View>

      <View style={styles.box}>
        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={() => navigation.navigate('Bildirişlər')}>
          {/* <Icon name="bell" size={22} color="#2D64AF" /> */}
          <SvgImage source={require('assets/icons/svg/ring.svg')} />
          {/* <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View> */}
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        <TouchableOpacity onPress={() => navigation.navigate('Profil')}>
          {profileImage ? (
            <Image source={{uri: profileImage}} style={styles.avatar} />
          ) : (
            <View style={styles.initialsPlaceholder}>
              <Text style={styles.initialsText}>
                {getInitials(firstName, lastName)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 15,
  },
  searchContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderRadius: 25,
    paddingHorizontal: 12,
    flex: 1,
    height: 40,
    color: '#2D64AF',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    fontSize: 14,
    color: '#2D64AF',
    flex: 1,
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#2D64AF',
    width: 18,
    height: 18,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  box: {
    width: 40,
    height: 40,
    backgroundColor: '#F2F2F2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    textAlign: 'center',
  },
  image: {
    width: 110,
    height: '100%',
    objectFit: 'cover',
  },
  initialsPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1269B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
