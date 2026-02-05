import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SvgImage} from './SvgImage';
import {Routes} from '@navigation/routes';
import {apiService} from '../services/apiService';
import {API_ENDPOINTS} from '../services/api_endpoint';

export type RootStackParamList = {
  home: undefined;
  login: undefined;
  Profil: undefined;
  Hesabatlar: undefined;
  splash: undefined;
  notifications: undefined;
  Tapşırıqlar: undefined;
  TaskProcess: {taskData: any};
  Terminallar: undefined;
  currentTask: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  title: string;
  description: string;
  screenName: keyof RootStackParamList;
  iconName: any;
  taskData?: any;
};

const MenuCard: React.FC<Props> = ({
  title,
  description,
  screenName,
  iconName,
  taskData,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = async () => {
    if (screenName === Routes.taskProcess) {
      try {
        const userRole = await AsyncStorage.getItem('roleName');
        const endpointBase =
          userRole === 'Collector'
            ? API_ENDPOINTS.mobile.collector.getAll
            : API_ENDPOINTS.mobile.technician.getAll;

        const response: any = await apiService.get(endpointBase);
        const inProgressCount: number = response?.inProgressTaskCount ?? 0;

        if (inProgressCount > 1) {
          navigation.navigate(Routes.currentTask as never);
          return;
        } else if (inProgressCount === 1) {
          const activeTask = response?.tasks?.find((t: any) => t.status === 1);
          if (activeTask) {
            navigation.navigate(Routes.taskProcess as never, {
              taskData: activeTask,
            } as never);
            return;
          }
        }
      } catch (error) {
        console.error('Cari tapşırıqlar alınarkən xəta:', error);
      }

      if (taskData) {
        navigation.navigate(screenName as never, {taskData} as never);
        return;
      }
    }

    navigation.navigate(screenName as never);
  };
  console.log('===============screenName=====================');
  console.log(screenName, taskData);
  console.log('====================================');

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.iconContainer}>{iconName}</View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.fixedIcon}>
        <SvgImage source={require('assets/icons/svg/arrow-right.svg')} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    height: 115,
    paddingLeft: 20,
    marginBottom: 15,
    position: 'relative',
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginRight: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 27,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 24,
  },
  description: {
    color: '#767676',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 18,
  },
  fixedIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#2D64AF',
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
});

export default MenuCard;
