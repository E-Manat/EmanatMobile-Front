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
import {SvgImage} from './SvgImage';

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

const UniversalSelectModal: React.FC<Props> = ({
  visible,
  onClose,
  data,
  title,
  onSelect,
}) => {
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

  const handleSelect = (item: Item) => {
    onSelect(item);
    setSearchText('');
    onClose();
  };

  const handleClose = () => {
    setSearchText('');
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      backdropOpacity={0.4}
      style={styles.modalWrapper}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleClose}>
            <SvgImage source={require('assets/icons/svg/x-icon.svg')} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Axtar..."
            value={searchText}
            placeholderTextColor={'#4F4F4F'}
            onChangeText={setSearchText}
            style={styles.searchInput}
            autoCorrect={false}
            clearButtonMode="never"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearButton}>
              <SvgImage
                source={require('assets/icons/svg/x-icon.svg')}
                width={16}
                height={16}
                color="#4B5D6A"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.listWrapper}>
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id.toString()}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={5}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect(item)}>
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
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: '#E0E3E6',
  },
  searchInput: {
    height: 40,
    borderColor: '#E0E3E6',
    borderRadius: 8,
    paddingRight: 36,
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
