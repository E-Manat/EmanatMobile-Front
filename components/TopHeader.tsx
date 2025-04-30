import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Profil'>;

type TopHeaderProps = {
  title: string;
  rightIconName?: string;
  onRightPress?: () => void;
  rightIconComponent?: React.ReactNode;
};

const TopHeader = ({title, rightIconName, onRightPress,rightIconComponent}: TopHeaderProps) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <LinearGradient
      colors={['#3C85C4', '#1269B5']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.headerText}>{title}</Text>

      {rightIconComponent ? (
        <TouchableOpacity onPress={onRightPress}>
          {rightIconComponent}
        </TouchableOpacity>
      ) : rightIconName ? (
        <TouchableOpacity onPress={onRightPress}>
          <Icon name={rightIconName} size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={{width: 24}} />
      )}
    </LinearGradient>
  );
};

export default TopHeader;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2D64AF',
    height: 140,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerText: {
    color: '#FFF', // Ağ rəng
    fontFamily: 'DMSans-SemiBold', // Fontu təyin etmək
    fontSize: 20, // Font ölçüsü
    fontStyle: 'normal', // Font üslubu
    fontWeight: '600', // Semibold (qalın)
    lineHeight: 26, // Sətir hündürlüyü (130% bərabərdir 26px)
  },
});
