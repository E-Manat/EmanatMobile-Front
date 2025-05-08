import {Modal, View, Text, TouchableOpacity, FlatList} from 'react-native';

const CustomPickerModal = ({visible, onClose, options, onSelect}: any) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: '#000000aa',
          justifyContent: 'center',
        }}>
        <View
          style={{
            backgroundColor: 'white',
            margin: 20,
            borderRadius: 10,
            padding: 20,
          }}>
          <TouchableOpacity onPress={onClose} style={{alignSelf: 'flex-end'}}>
            {/* <Tras name="close" size={24} color="black" /> */}x
          </TouchableOpacity>
          <FlatList
            data={options}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => onSelect(item)}>
                <Text style={{padding: 10}}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CustomPickerModal;
