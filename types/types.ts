import {Routes} from '@navigation/routes';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  [Routes.auth]: undefined;
  [Routes.main]: undefined;
};

export type AuthStackParamList = {
  [Routes.login]: undefined;
  [Routes.forgotPassword]: undefined;
  [Routes.otp]: undefined;
  [Routes.otpSubmit]: {email?: string};
  [Routes.onboarding]: undefined;
  [Routes.newPassword]: {email: string};
};

export type MainStackParamList = {
  [Routes.mainTabs]: {screen?: string} | undefined;
  [Routes.home]: undefined;
  [Routes.tasks]: undefined;
  [Routes.profile]: undefined;
  [Routes.profileDetail]: undefined;
  [Routes.notifications]: undefined;
  [Routes.reports]: undefined;
  [Routes.newReport]: {terminalId?: any};
  [Routes.terminals]: undefined;
  [Routes.terminalDetails]: {taskData: any};
  [Routes.detailedReport]: {report: any};
  [Routes.taskProcess]: {taskData?: any; startTime?: any};
  [Routes.pinSetup]: undefined;
  [Routes.currentTask]: undefined;
};

export type AppNavigation = NativeStackNavigationProp<
  RootStackParamList & AuthStackParamList & MainStackParamList
>;
