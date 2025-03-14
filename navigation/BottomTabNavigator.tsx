import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportsIcon from 'react-native-vector-icons/SimpleLineIcons';
import HomeIcon from 'react-native-vector-icons/Octicons';
import Icon from 'react-native-vector-icons/Feather';
import {TouchableOpacity} from 'react-native';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({color, size}) => {
          switch (route.name) {
            case 'Ana səhifə':
              return <HomeIcon name="home" size={size} color={color} />;
            case 'Tapşırıqlar':
              return <Icon name="clipboard" size={size} color={color} />;
            case 'Hesabatlar':
              return <ReportsIcon name="chart" size={size} color={color} />;
            case 'Profil':
              return <Icon name="user" size={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          elevation: 0,
          shadowOpacity: 0.1,
        },
        tabBarButton: props => (
          <TouchableOpacity
            {...(props ?? {})} // Ensure props is never null or undefined
            activeOpacity={0.6}
          />
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
