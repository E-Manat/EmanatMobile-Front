import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {launchCamera} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const NewReportScreen = () => {
  const [selectedTerminal, setSelectedTerminal] = useState('');
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedImages, setSelectedImages] = useState<any>([]);
  const [comment, setComment] = useState('');

  const takePhoto = () => {
    const options: any = {
      mediaType: 'photo',
      cameraType: 'back',
      quality: 1,
      saveToPhotos: true,
    };

    launchCamera(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Xəta', 'Kamera açılmadı');
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) setSelectedImages([...selectedImages, uri]);
    });
  };

  const removeImage = (index: any) => {
    const updatedImages = selectedImages.filter(
      (_: any, i: any) => i !== index,
    );
    setSelectedImages(updatedImages);
  };

  const handleSubmit = () => {
    if (
      !selectedTerminal ||
      !selectedProblem ||
      !comment ||
      selectedImages.length === 0
    ) {
      Alert.alert(
        'Xəta',
        'Zəhmət olmasa terminal, problem, şəkil və şərh əlavə edin.',
      );
      return;
    }
    Alert.alert('Uğurla göndərildi!', 'Hesabatınız qəbul edildi.');
  };
  const navigation = useNavigation();
  return (
    <View style={{padding: 20}}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={24} color="#2D64AF" />
      </TouchableOpacity>
      <Text style={{fontSize: 18, marginBottom: 5}}>Terminalı seçin</Text>
      <Picker
        selectedValue={selectedTerminal}
        onValueChange={itemValue => setSelectedTerminal(itemValue)}
        style={{borderWidth: 1, borderColor: '#ddd', marginBottom: 10}}>
        <Picker.Item label="Terminal ID seçin" value="" />
        <Picker.Item label="Terminal 001" value="001" />
        <Picker.Item label="Terminal 002" value="002" />
        <Picker.Item label="Terminal 003" value="003" />
      </Picker>

      <Text style={{fontSize: 18, marginBottom: 5}}>
        Texniki problemi seçin
      </Text>
      <Picker
        selectedValue={selectedProblem}
        onValueChange={itemValue => setSelectedProblem(itemValue)}
        style={{borderWidth: 1, borderColor: '#ddd', marginBottom: 10}}>
        <Picker.Item label="Texniki problem seçin" value="" />
        <Picker.Item label="Ekran işləmir" value="screen" />
        <Picker.Item label="Printer problemi" value="printer" />
        <Picker.Item label="Bağlantı problemi" value="network" />
      </Picker>

      <Text style={{fontSize: 18, marginBottom: 10}}>
        Terminalın şəklini yükləyin *
      </Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10}}>
        {selectedImages.map((image: any, index: any) => (
          <View key={index} style={{position: 'relative', marginRight: 5}}>
            <Image
              source={{uri: image}}
              style={{width: 70, height: 70, borderRadius: 5}}
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: 'red',
                borderRadius: 12,
                padding: 3,
              }}
              onPress={() => removeImage(index)}>
              <Text style={{color: 'white', fontSize: 12}}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          onPress={takePhoto}
          style={{
            width: 70,
            height: 70,
            backgroundColor: '#ddd',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
          }}>
          <Text style={{fontSize: 20}}>📷</Text>
        </TouchableOpacity>
      </View>

      <Text style={{fontSize: 18, marginBottom: 10}}>Şərh əlavə edin *</Text>
      <TextInput
        placeholder="Şərhinizi bura yazın..."
        style={{
          borderColor: '#ddd',
          borderWidth: 1,
          borderRadius: 5,
          padding: 10,
          marginBottom: 20,
        }}
        value={comment}
        onChangeText={setComment}
      />

      <Button title="Göndər" onPress={handleSubmit} color="#007BFF" />
    </View>
  );
};

export default NewReportScreen;
