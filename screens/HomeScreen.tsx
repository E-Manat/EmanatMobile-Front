import React, {useEffect} from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import MenuCard from '../components/MenuCard';
import Banner from '../components/Banner';
import Location from '../components/Location';
import {globalStyles} from '../globalStyles';
import Icon3 from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/AntDesign';
import HomeHeader from '../components/HomeHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  useEffect(() => {
    const logAllAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const result = await AsyncStorage.multiGet(keys);
        console.log('AsyncStorage content:');
        result.forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
      }
    };

    logAllAsyncStorage();
  }, []);

  return (
    <ScrollView style={globalStyles.container}>
      <HomeHeader />
      <Banner />
      <MenuCard
        title="Tapşırıqlar"
        description="Cari tapşırıqların siyahısı"
        screenName="Tapşırıqlar"
        iconName={<Icon3 name="clipboard" size={23} color="#2D64AF" />}
      />
      {/* <MenuCard
        title="Terminallar"
        description="İnkassasiya tapşırıqlarının idarə edilməsi"
        screenName="Profil"
        iconName={<Icon1 name="idcard" size={23} color="#2D64AF" />}
      /> */}
      <MenuCard
        title="Hesabatlar"
        description="Yerinə yetirilmiş tapşırıqlar üzrə hesabat"
        screenName="Hesabatlar"
        iconName={<Icon2 name="dollar" size={23} color="#2D64AF" />}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({});
export default HomeScreen;
