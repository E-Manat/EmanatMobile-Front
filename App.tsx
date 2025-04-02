import {StatusBar} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {enableScreens} from 'react-native-screens';
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import ReportsScreen from './screens/ReportsScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TasksScreen from './screens/TasksScreen';
import DetailedReportScreen from './screens/DetailedReportScreen';
import NewPasswordScreen from './screens/NewPasswordScreen';
import PinSetupScreen from './screens/PinSetupScreen';
import TerminalDetailsScreen from './screens/TerminalDetailsScreen';
import NewReportScreen from './screens/NewReportScreen';
import RouteScreen from './screens/RouteScreen';

const Stack = createNativeStackNavigator();
enableScreens();

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  NewPassword: undefined;
  'Ana səhifə': undefined;
  Tapşırıqlar: undefined;
  Profil: undefined;
  Bildirişlər: undefined;
  Hesabatlar: undefined;
  YeniHesabat: undefined;
  TerminalEtrafli: {taskData: any};
  HesabatEtrafli: {report: any};
  Route: undefined;
  PinSetup: undefined;
};

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false, animation: 'fade'}}>
        <Stack.Group>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          <Stack.Screen name="Ana səhifə" component={BottomTabNavigator} />
          <Stack.Screen name="Tapşırıqlar" component={TasksScreen} />
          <Stack.Screen name="Profil" component={ProfileScreen} />
          <Stack.Screen name="Bildirişlər" component={NotificationsScreen} />
          <Stack.Screen name="Hesabatlar" component={ReportsScreen} />
          <Stack.Screen name="YeniHesabat" component={NewReportScreen} />
          <Stack.Screen name="Route" component={RouteScreen} />
          <Stack.Screen
            name="HesabatEtrafli"
            component={DetailedReportScreen}
          />
          <Stack.Screen
            name="TerminalEtrafli"
            component={TerminalDetailsScreen}
          />
          <Stack.Screen name="PinSetup" component={PinSetupScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
