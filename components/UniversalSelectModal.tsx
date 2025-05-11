import React from 'react';
import Modal from 'react-native-modal';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

type Item = {
  id: number | string;
  name: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  data: Item[];
  title: string;
  onSelect: (item: Item) => void;
};

const UniversalSelectModal = ({
  visible,
  onClose,
  data,
  title,
  onSelect,
}: Props) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      style={{justifyContent: 'center', margin: 0}}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="x" size={20} color="#4B5D6A" />
          </TouchableOpacity>
        </View>

        <View style={styles.listWrapper}>
          <FlatList
            data={data}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}>
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default UniversalSelectModal;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E3E6',
    paddingBottom: 8,
  },
  title: {
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  option: {
    paddingVertical: 12,
  },
  optionText: {
    color: '#616161',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  listWrapper: {
    maxHeight: 400, // təxminən 6-7 seçimlik yer üçün ideal
  },
});
