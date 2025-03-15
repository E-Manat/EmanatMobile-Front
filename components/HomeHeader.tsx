import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeHeader = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);

  const loadProfileData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('profileData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setProfileImage(parsedData.profileImage);
      }
    } catch (error) {
      console.log('Məlumat oxuma xətası:', error);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={18}
          color="#2D64AF"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Axtar..."
          placeholderTextColor="#2D64AF"
          style={styles.input}
        />
      </View>

      <View style={styles.box}>
        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={() => navigation.navigate('Bildirişlər')}>
          <Icon name="bell" size={22} color="#2D64AF" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        <TouchableOpacity onPress={() => navigation.navigate('Profil')}>
          <Image
            source={
              profileImage
                ? {uri: profileImage}
                : require('../assets/img/user.png')
            }
            style={styles.avatar}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
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
});
