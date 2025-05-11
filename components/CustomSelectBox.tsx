import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

type Props = {
  label: string;
  placeholder: string;
  value?: string;
  onPress: () => void;
  error?: boolean;
};

const CustomSelectBox = ({
  label,
  placeholder,
  value,
  onPress,
  error,
}: Props) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectBox, error && {borderColor: 'red'}]}
        onPress={onPress}>
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={20} color="#777" />
      </TouchableOpacity>
    </View>
  );
};

export default CustomSelectBox;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'DMSans-SemiBold',
  },
  selectBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF5E7',
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#9E9E9E',
  },
  placeholder: {
    color: '#9E9E9E',
  },
});
