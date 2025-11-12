import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DeviceEventEmitter} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';
import BottomTabNavigator from './BottomTabNavigator';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TasksScreen from '../screens/TasksScreen';
import DetailedReportScreen from '../screens/DetailedReportScreen';
import PinSetupScreen from '../screens/PinSetupScreen';
import TerminalDetailsScreen from '../screens/TerminalDetailsScreen';
import NewReportScreen from '../screens/NewReportScreen';
import TaskProcessScreen from '../screens/TaskProcessScreen';
import TerminalsScreen from '../screens/TerminalsScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import DraggableTaskButton from '../components/DraggableTaskButton';
import CustomModal from '../components/Modal';
import {Routes} from './routes';
import {navigationRef} from '@utils/navigationUtils';
import {defaultScreenOptions} from '@utils/navigationConfig';

const MainStack = createNativeStackNavigator();

export const MainRouter = () => {
  const [currentRouteName, setCurrentRouteName] = useState('');
  const [hasCurrentTask, setHasCurrentTask] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [downloadUrl] = useState(
    'https://drive.google.com/drive/folders/1ndnxNUn1Bn1LZM28RBzxhiT1MccvGoRp?usp=drive_link',
  );

  const version = 2;

  const checkForUpdate = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        `${Config.API_URL}/mobile/Version/Check`,
        {versionCode: version},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.data.isUpdateAvailable) {
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Update check error:', error);
    }
  };

  const handleUpdate = async () => {
    if (downloadUrl) {
      const {Linking} = await import('react-native');
      await Linking.openURL(downloadUrl);
    }
    setModalVisible(false);
  };

  const checkCurrentTask = async () => {
    const task = await AsyncStorage.getItem('currentTask');
    setHasCurrentTask(!!task);
  };

  useEffect(() => {
    checkForUpdate();
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('taskStarted', () => {
      setHasCurrentTask(true);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(checkCurrentTask, 200);
    checkCurrentTask();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateRouteName = async () => {
      const route = navigationRef.current?.getCurrentRoute();
      setCurrentRouteName(route?.name || '');
      await checkCurrentTask();
    };

    if (navigationRef.current) {
      navigationRef.current.addListener('state', updateRouteName);
    }

    return () => {
      if (navigationRef.current) {
        navigationRef.current.removeListener('state', updateRouteName);
      }
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1}} edges={['bottom']}>
      <CustomModal
        visible={modalVisible}
        title="Yeniləmə Mövcuddur"
        description="Yeni versiya mövcuddur. Tətbiqi yeniləməyiniz tövsiyyə olunur"
        confirmText="Yenilə"
        onConfirm={handleUpdate}
      />
      <MainStack.Navigator
        screenOptions={defaultScreenOptions}
        initialRouteName={Routes.home}>
        <MainStack.Screen name={Routes.home} component={BottomTabNavigator} />
        <MainStack.Screen name={Routes.tasks} component={TasksScreen} />
        <MainStack.Screen name={Routes.profile} component={ProfileScreen} />
        <MainStack.Screen
          name={Routes.notifications}
          component={NotificationsScreen}
        />
        <MainStack.Screen name={Routes.reports} component={ReportsScreen} />
        <MainStack.Screen name={Routes.newReport} component={NewReportScreen} />
        <MainStack.Screen name={Routes.terminals} component={TerminalsScreen} />
        <MainStack.Screen
          name={Routes.taskProcess}
          component={TaskProcessScreen}
        />
        <MainStack.Screen
          name={Routes.profileDetail}
          component={ProfileDetailScreen}
        />
        <MainStack.Screen
          name={Routes.detailedReport}
          component={DetailedReportScreen}
        />
        <MainStack.Screen
          name={Routes.terminalDetails}
          component={TerminalDetailsScreen}
        />
        <MainStack.Screen name={Routes.pinSetup} component={PinSetupScreen} />
      </MainStack.Navigator>
      {!['Splash', 'Login'].includes(currentRouteName) && hasCurrentTask && (
        <DraggableTaskButton />
      )}
    </SafeAreaView>
  );
};
