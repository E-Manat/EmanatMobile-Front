import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import TopHeader from '../components/TopHeader';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {useProfileStore} from 'stores/useProfileStore';

const ProfileDetailScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.profileDetail>
> = ({navigation}) => {
  const {profile, loading, loadProfile} = useProfileStore();

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, []);

  if (loading || !profile) {
    return <View style={styles.container} />;
  }

  return (
    <>
      <View style={styles.container}>
        <TopHeader title="Profil" />

        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={styles.imageContainer}>
              <FastImage
                source={
                  profile.profileImage
                    ? {uri: profile.profileImage, priority: FastImage.priority.normal}
                    : require('../assets/img/default.jpg')
                }
                style={styles.profileImage}
              />
            </View>
          </TouchableOpacity>

          <View>
            <Text style={styles.profileName}>
              {profile.firstName} {profile.lastName}
            </Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Əlaqə nömrəsi</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profile.phone}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profile.email}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ünvan</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={profile.address}
              editable={false}
            />
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
