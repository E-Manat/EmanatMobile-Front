import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/AntDesign';
import {SvgImage} from './SvgImage';
import {Routes} from '@navigation/routes';

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

  const handlePress = () => {
    if (screenName === Routes.taskProcess && taskData) {
      navigation.navigate(screenName, {taskData});
    } else {
      navigation.navigate(screenName);
    }
  };

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
