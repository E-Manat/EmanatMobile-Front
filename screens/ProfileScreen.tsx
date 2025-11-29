/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import TopHeader from '../components/TopHeader';
import {OutIcon, SecurityIcon, UserIcon} from '../assets/icons';
import CustomModal from '../components/Modal';
import {Routes} from '@navigation/routes';
import {SvgImage} from '@components/SvgImage';
import {MainStackParamList} from 'types/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useProfileStore} from 'stores/useProfileStore';

const ProfileScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.profile>
> = ({navigation}) => {
  const {profile, loadProfile, clearProfile} = useProfileStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutConfirmModalVisible, setLogoutConfirmModalVisible] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const confirmLogout = async () => {
    try {
      await clearProfile();
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('userPin');
      await AsyncStorage.removeItem('roleName');
      navigation.replace(Routes.auth as any, {screen: Routes.login} as any);
    } catch (error) {}
  };

  const getInitials = (name: string, surname: string) => {
    const first = name?.trim()?.[0]?.toUpperCase() || 'A';
    const last = surname?.trim()?.[0]?.toUpperCase() || 'B';
    return `${first}${last}`;
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flexGrow: 1}}>
          <View style={styles.container}>
            <TopHeader title="Profil" />
            <View style={styles.profileContainer}>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={styles.imageContainer}>
                  {profile?.profileImage ? (
                    <Image
                      source={{uri: profile.profileImage}}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.initialsPlaceholder}>
                      <Text style={styles.initialsText}>
                        {getInitials(
                          profile?.firstName || '',
                          profile?.lastName || '',
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <View>
                <Text style={styles.profileName}>
                  {profile?.firstName} {profile?.lastName}
                </Text>
                <Text style={styles.profileRoleName}>{profile?.roleName}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate(Routes.profileDetail)}>
                <View style={styles.iconBox}>
                  <UserIcon color="#1269B5" />
                </View>
                <Text style={styles.text}>Profil məlumatları</Text>
                <SvgImage
                  source={require('assets/icons/svg/chevron-right.svg')}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.itemContainer}>
                <View style={styles.iconBox}>
                  <SecurityIcon color="#1269B5" />
                </View>
                <Text style={styles.text}>Təhlükəsizlik</Text>
                <SvgImage
                  source={require('assets/icons/svg/chevron-right.svg')}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.itemContainer}>
                <View style={{gap: 12, display: 'flex', flexDirection: 'row'}}>
                  <SvgImage
                    width={32}
                    height={32}
                    source={require('assets/icons/svg/app-version.svg')}
                  />
                  <View style={styles.gap}>
                    <Text style={styles.text}>Proqram versiyası</Text>
                    <Text style={styles.textVersion}>1.0.1</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => setLogoutConfirmModalVisible(true)}>
                <View style={styles.iconBox}>
                  <OutIcon color="#1269B5" />
                </View>
                <Text style={styles.text}>Çıxış</Text>
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
                    profile?.profileImage
                      ? {uri: profile.profileImage}
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
        </View>
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
    fontFamily: 'DM Sans',
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
  initialsPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 45,
    backgroundColor: '#1269B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
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
    lineHeight: 24,
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
    fontStyle: 'normal',
    flex: 1,
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
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  textVersion: {
    color: '#9E9E9E',
    fontFamily: 'DM Sans',
    fontSize: 10,
    fontStyle: 'normal',
    fontWeight: '400',
  },
  gap: {},
});
