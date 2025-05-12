import React, {useEffect, useState} from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import MenuCard from '../components/MenuCard';
import Banner from '../components/Banner';
import {globalStyles} from '../globalStyles';
import HomeHeader from '../components/HomeHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Image1 from '../assets/icons/img1.svg';
import Image2 from '../assets/icons/img2.svg';
import Image3 from '../assets/icons/img3.svg';
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
  const [taskData, setTaskData] = useState<any>(null);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const task = await AsyncStorage.getItem('currentTask');
        if (task) {
          setTaskData(JSON.parse(task));
        }
      } catch (error) {
        console.error('Error reading task from AsyncStorage:', error);
      }
    };

    fetchTaskData();
  }, []);

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{paddingBottom: 40}}>
      <HomeHeader />
      <Banner />
      {taskData !== null && (
        <MenuCard
          title="Cari Tapşırıq"
          description="Hal hazırda davam edən tapşırıq"
          screenName="TaskProcess"
          iconName={<Image3 />}
          taskData={taskData}
        />
      )}

      <MenuCard
        title="Tapşırıqlar"
        description="Cari tapşırıqların siyahısı"
        screenName="Tapşırıqlar"
        iconName={<Image1 />}
      />
      <MenuCard
        title="Terminallar"
        description="Ərazi üzrə terminalların siyahısı"
        screenName="Terminallar"
        iconName={<Image2 />}
      />
      <MenuCard
        title="Hesabatlar"
        description="Yerinə yetirilmiş tapşırıqlar üzrə hesabat"
        screenName="Hesabatlar"
        iconName={<Image3 />}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({});
export default HomeScreen;
