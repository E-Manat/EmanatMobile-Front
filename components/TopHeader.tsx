import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SvgImage} from './SvgImage';

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
  variant = 'default',
}: TopHeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const contentHeight = variant === 'tapsiriq' ? 70 : 70;

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          height: contentHeight + insets.top,
        },
      ]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}>
        <SvgImage
          source={require('assets/icons/svg/go-back.svg')}
          color={'white'}
        />
      </TouchableOpacity>

      <Text style={styles.headerText}>{title}</Text>

      {rightIconComponent ? (
        <TouchableOpacity onPress={onRightPress}>
          {rightIconComponent}
        </TouchableOpacity>
      ) : rightIconName ? (
        <TouchableOpacity onPress={onRightPress}>
          <Icon name={rightIconName} size={28} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={{width: 28}} />
      )}
    </View>
  );
};

export default TopHeader;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2D64AF',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerText: {
    color: '#FFF',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
});
