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
    marginBottom: 10,
    position: 'relative',
    paddingHorizontal: 12,
    height: 90,
  },
  iconContainer: {
    marginRight: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 27,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1269B5',
  },
  description: {
    fontSize: 12,
    marginTop: 4,
    color: '#767676',
    fontWeight: 500,
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
