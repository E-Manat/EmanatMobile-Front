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
  variant?: 'default' | 'tapsiriq';
};

const TopHeader = ({
  title,
  rightIconName,
  onRightPress,
  rightIconComponent,
  variant,
}: TopHeaderProps) => {
  const navigation = useNavigation<NavigationProp>();
  const computedHeight = variant === 'tapsiriq' ? 140 : 90;
  return (
    <LinearGradient
      colors={['#3C85C4', '#1269B5']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[styles.header, {height: computedHeight}]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.headerText}>{title}</Text>

      {rightIconComponent ? (
        <TouchableOpacity onPress={onRightPress}>
          {rightIconComponent}
        </TouchableOpacity>
      ) : rightIconName ? (
        <TouchableOpacity onPress={onRightPress}>
          <Icon name={rightIconName} size={30} color="#fff" />
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
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerText: {
    color: '#FFF',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 26,
  },
});
