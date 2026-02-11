import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Platform, TouchableOpacity} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {HomeIcon, ReportIcon, TaskIcon, UserIcon} from '../assets/icons';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({color}) => {
          switch (route.name) {
            case 'Ana səhifə':
              return <HomeIcon color={color} />;
            case 'Tapşırıqlar':
              return <TaskIcon color={color} />;
            case 'Hesabatlar':
              return <ReportIcon color={color} />;
            case 'Profil':
              return <UserIcon color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: Platform.OS === 'android' ? 60 : 70,
          elevation: 0,
          shadowOpacity: 0.1,
          position: 'absolute',
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarButton: props => (
          <TouchableOpacity {...(props ?? {})} activeOpacity={0.6} />
        ),
      })}>
      <Tab.Screen name="Ana səhifə" component={HomeScreen} />
      <Tab.Screen name="Tapşırıqlar" component={TasksScreen} />
      <Tab.Screen name="Hesabatlar" component={ReportsScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
