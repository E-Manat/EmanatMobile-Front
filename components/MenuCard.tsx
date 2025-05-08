import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/AntDesign';

export type RootStackParamList = {
  home: undefined;
  login: undefined;
  Profil: undefined;
  Hesabatlar: undefined;
  splash: undefined;
  notifications: undefined;
  Tapşırıqlar: undefined;
  Terminallar: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  title: string;
  description: string;
  screenName: keyof RootStackParamList;
  iconName: any;
};

const MenuCard: React.FC<Props> = ({
  title,
  description,
  screenName,
  iconName,
}) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(screenName)}>
      <View style={styles.iconContainer}>{iconName}</View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.fixedIcon}>
        <Icon name="arrowright" size={24} color="#fff" />
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
    height: 90,
    paddingLeft:20,
    marginBottom: 25,
    position: 'relative',
    paddingHorizontal: 12,
    shadowColor: '#75ACDA',
    shadowRadius: 5,
    elevation: 6,
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
    color: '#1269B5', // Primary color
    fontFamily: 'DMSans-SemiBold', // Font family
    fontSize: 16, // Font size
    fontStyle: 'normal', // Font style
    fontWeight: '600', // Semibold weight
    lineHeight: 24, // Line height equivalent to 150% of 16px
  },
  description: {
    color: '#767676', // Grey color
    fontFamily: 'DMSans-Regular', // Font family
    fontSize: 12, // Font size
    fontStyle: 'normal', // Font style
    fontWeight: '500', // Medium weight
    lineHeight: 18, // Line height equivalent to 150% of 12px
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
