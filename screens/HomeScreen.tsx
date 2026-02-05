import React, {use, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import MenuCard from '../components/MenuCard';
import {globalStyles} from '../globalStyles';
import HomeHeader from '../components/HomeHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Image1 from '../assets/icons/img1.svg';
import Image2 from '../assets/icons/img2.svg';
import Image3 from '../assets/icons/img3.svg';
import {useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {apiService} from '../services/apiService';
import {API_ENDPOINTS} from '../services/api_endpoint';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const HomeScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.home>
> = () => {
  // useEffect(() => {
  //   const clearAllAsyncStorage = async () => {
  //     try {
  //       await AsyncStorage.clear();
  //     } catch (error) {
  //       console.error('Error clearing AsyncStorage:', error);
  //     }
  //   };

  //   clearAllAsyncStorage();
  // }, []);

  const isFocused = useIsFocused();
  const [taskData, setTaskData] = useState<any>(null);

  const fetchTaskData = async () => {
    try {
      const task = await AsyncStorage.getItem('currentTask');
      if (task) {
        setTaskData(JSON.parse(task));
      }

      const userRole = await AsyncStorage.getItem('roleName');
      const endpointBase =
        userRole === 'Collector'
          ? API_ENDPOINTS.mobile.collector.getAll
          : API_ENDPOINTS.mobile.technician.getAll;

      const response: any = await apiService.get(endpointBase);
      const inProgressCount = response?.inProgressTaskCount ?? 0;

      if (inProgressCount > 0) {
        const activeTask = response.tasks.find((t: any) => t.status === 1);
        if (activeTask) {
          setTaskData(activeTask);
          await AsyncStorage.setItem('currentTask', JSON.stringify(activeTask));
        }
      } else {
        setTaskData(null);
        await AsyncStorage.removeItem('currentTask');
      }
    } catch (error) {
      console.error('Error reading task from AsyncStorage or API:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchTaskData();
    }
  }, [isFocused]);
  const {top} = useSafeAreaInsets();
  console.log('==========================taskDatataskData==========');
  console.log(taskData);
  console.log('====================================');

  return (
    <View style={[globalStyles.container, {paddingTop: top}]}>
      <HomeHeader />
      <View style={styles.spacer} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  spacer: {
    height: 30,
  },
});

export default HomeScreen;
