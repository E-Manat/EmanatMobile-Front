import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';

type Item = {
  id: number | string;
  name: number | string;
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
  const [searchText, setSearchText] = useState('');

  const filteredData = useMemo(
    () =>
      data.filter(item =>
        String(item.name)
          .toLowerCase()
          .includes(searchText.trim().toLowerCase()),
      ),
    [data, searchText],
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      style={styles.modalWrapper}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="x" size={20} color="#4B5D6A" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Axtar..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            autoCorrect={false}
            clearButtonMode="never"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearButton}>
              <Icon name="x" size={16} color="#4B5D6A" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.listWrapper}>
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}>
                <Text style={styles.optionText}>{String(item.name)}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nəticə yoxdur</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default UniversalSelectModal;

const styles = StyleSheet.create({
  modalWrapper: {justifyContent: 'center', margin: 0},
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  searchWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  searchInput: {
    height: 40,
    // borderBottomWidth: 1,
    borderColor: '#E0E3E6',
    borderRadius: 8,
    // paddingHorizontal: 10,
    paddingRight: 36, // space for clear button
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{translateY: -8}],
  },
  listWrapper: {
    maxHeight: 400,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#999',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
});
