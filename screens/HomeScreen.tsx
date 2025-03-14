import React from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import MenuCard from '../components/MenuCard';
import Banner from '../components/Banner';
import Location from '../components/Location';
import {globalStyles} from '../globalStyles';
import Icon3 from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/AntDesign';
import HomeHeader from '../components/HomeHeader';

const HomeScreen = () => {
  return (
    <ScrollView style={globalStyles.container}>
      <HomeHeader />
      <Location />
      <Banner />
      <MenuCard
        title="İnkassasiya"
        description="İnkassasiya tapşırıqlarının idarə edilməsi"
        screenName="Profil"
        iconName={<Icon1 name="idcard" size={23} color="#2D64AF" />}
      />
      <MenuCard
        title="Hesabatlar"
        description="Yerinə yetirilmiş tapşırıqlar üzrə hesabat"
        screenName="Hesabatlar"
        iconName={<Icon2 name="dollar" size={23} color="#2D64AF" />}
      />
      <MenuCard
        title="Tapşırıqlar"
        description="Cari tapşırıqların siyahısı"
        screenName="Tapşırıqlar"
        iconName={<Icon3 name="clipboard" size={23} color="#2D64AF" />}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({});
export default HomeScreen;
