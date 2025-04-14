import {StatusBar} from 'react-native';
import React, {useEffect, useRef} from 'react';
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
import TaskProcessScreen from './screens/TaskProcessScreen';
import TerminalsScreen from './screens/TerminalsScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import OtpScreen from './screens/OtpScreen';
import ProfileDetailScreen from './screens/ProfileDetailScreen';
import DraggableTaskButton from './components/DraggableTaskButton';
import {setNavigation} from './services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkTokenExpiry} from './utils/checkTokenExpiry';
import OtpSubmitScreen from './screens/OtpSubmitScreen';
const Stack = createNativeStackNavigator();
enableScreens();

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  'Ana səhifə': undefined;
  Tapşırıqlar: undefined;
  Profil: undefined;
  ProfileDetail: undefined;
  Bildirişlər: undefined;
  Hesabatlar: undefined;
  YeniHesabat: undefined;
  Terminallar: undefined;
  TerminalEtrafli: {taskData: any};
  HesabatEtrafli: {report: any};
  TaskProcess: {taskData?: any; startTime?: any};
  PinSetup: undefined;
  ForgotPassword: undefined;
  OtpSubmit: {email?: any};
  NewPassword: {email: any};
};

const App = () => {
  const navigationRef = React.useRef<any>(null);

  React.useEffect(() => {
    setNavigation(navigationRef.current);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const isExpired = await checkTokenExpiry();
      if (isExpired) {
        await AsyncStorage.multiRemove([
          'userToken',
          'expiresAt',
          'isLoggedIn',
        ]);
        navigationRef?.current?.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      } else {
        navigationRef?.current?.reset({
          index: 0,
          routes: [{name: 'Home'}],
        });
      }
    };

    checkAuth();
  }, []);

  return (
    <NavigationContainer
      ref={nav => {
        navigationRef.current = nav;
        setNavigation(navigationRef);
      }}>
      <StatusBar />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}>
        <Stack.Group>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Ana səhifə" component={BottomTabNavigator} />
          <Stack.Screen name="Tapşırıqlar" component={TasksScreen} />
          <Stack.Screen name="Profil" component={ProfileScreen} />
          <Stack.Screen name="Bildirişlər" component={NotificationsScreen} />
          <Stack.Screen name="Hesabatlar" component={ReportsScreen} />
          <Stack.Screen name="YeniHesabat" component={NewReportScreen} />
          <Stack.Screen name="Terminallar" component={TerminalsScreen} />
          <Stack.Screen name="TaskProcess" component={TaskProcessScreen} />
          <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="OtpSubmit" component={OtpSubmitScreen} />
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
      <DraggableTaskButton />
    </NavigationContainer>
  );
};

export default App;
