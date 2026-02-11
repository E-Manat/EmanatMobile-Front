/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {SvgImage} from './SvgImage';
import {useProfileStore} from 'stores/useProfileStore';

const HomeHeader = () => {
  const navigation = useNavigation<any>();
  const {profile, loadProfile} = useProfileStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.trim()?.[0]?.toUpperCase() || 'S';
    const last = lastName?.trim()?.[0]?.toUpperCase() || 'A';
    return `${first}${last}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SvgImage source={require('assets/icons/mpay.svg')} />
      </View>

      <View style={styles.box}>
        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={() => navigation.navigate('Bildirişlər')}>
          <SvgImage source={require('assets/icons/svg/ring.svg')} />
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        <TouchableOpacity onPress={() => navigation.navigate('Profil')}>
          {profile?.profileImage ? (
            <FastImage
              source={{uri: profile.profileImage, priority: FastImage.priority.normal}}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.initialsPlaceholder}>
              <Text style={styles.initialsText}>
                {getInitials(profile?.firstName || '', profile?.lastName || '')}
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
  notificationContainer: {
    position: 'relative',
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
