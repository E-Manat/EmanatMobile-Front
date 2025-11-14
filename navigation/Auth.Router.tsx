import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpScreen from '../screens/OtpScreen';
import OtpSubmitScreen from '../screens/OtpSubmitScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import OnBoardingScreen from '@screens/OnBoradingScreen';
import {Routes} from './routes';
import {authStackScreenOption} from '@utils/navigationConfig';
import {View} from 'react-native';
import {AuthStackParamList} from 'types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@hasSeenOnboarding';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export const AuthRouter = () => {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      setShowOnboarding(!hasSeenOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true);
    }
  };

  if (showOnboarding === null) {
    return <View style={{flex: 1, backgroundColor: '#1269B5'}} />;
  }

  return (
    <View style={{flex: 1}}>
      <AuthStack.Navigator
        screenOptions={authStackScreenOption}
        initialRouteName={showOnboarding ? Routes.onboarding : Routes.login}>
        {showOnboarding && (
          <AuthStack.Screen
            name={Routes.onboarding}
            component={OnBoardingScreen}
          />
        )}
        <AuthStack.Screen name={Routes.login} component={LoginScreen} />
        <AuthStack.Screen
          name={Routes.forgotPassword}
          component={ForgotPasswordScreen}
        />
        <AuthStack.Screen name={Routes.otp} component={OtpScreen} />
        <AuthStack.Screen name={Routes.otpSubmit} component={OtpSubmitScreen} />
        <AuthStack.Screen
          name={Routes.newPassword}
          component={NewPasswordScreen}
        />
      </AuthStack.Navigator>
    </View>
  );
};
