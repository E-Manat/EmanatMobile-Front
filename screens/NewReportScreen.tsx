import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {apiService} from '../services/apiService';
import TopHeader from '../components/TopHeader';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const NewReportScreen = () => {
  const [selectedTerminal, setSelectedTerminal] = useState('');
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedImages, setSelectedImages] = useState<any>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [problemList, setProblemList] = useState<any[]>([]);
  const [terminalList, setTerminalList] = useState<any[]>([]);
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

  const pickImageFromGallery = () => {
    const options: any = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Xəta', 'Şəkil seçilə bilmədi');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) setSelectedImages([...selectedImages, uri]);
    });
  };

  const pickVideo = () => {
    const options: any = {
      mediaType: 'video',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Xəta', 'Video seçilə bilmədi');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) setSelectedVideo(uri);
    });
  };

  const removeImage = (index: any) => {
    const updatedImages = selectedImages.filter(
      (_: any, i: any) => i !== index,
    );
    setSelectedImages(updatedImages);
  };

  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        const data = await apiService.get('/mobile/Terminal/GetAll');
        console.log(data, 'data');
        setTerminalList(data); // Store fetched terminals in state
      } catch (error) {
        console.error('Terminals could not be fetched:', error);
      }
    };

    fetchTerminals();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await apiService.get('/mobile/Problem/GetAll');
        setProblemList(data);
      } catch (error) {
        console.error('Problem siyahısı alınmadı:', error);
      }
    };

    fetchProblems();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      const terminalId = selectedTerminal; // Use selected terminal ID

      formData.append('TerminalId', terminalId);
      formData.append('ProblemId', selectedProblem);
      formData.append('Description', comment);

      selectedImages.forEach((uri: any, index: any) => {
        formData.append('Images', {
          uri,
          name: `image_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      if (selectedVideo) {
        formData.append('Video', {
          uri: selectedVideo,
          name: 'video.mp4',
          type: 'video/mp4',
        } as any);
      }

      await apiService.postMultipart('/mobile/Report/CreateReport', formData);
      Alert.alert('Uğurla göndərildi!', 'Hesabatınız qəbul edildi.');
      navigation.replace('Hesabatlar');
    } catch (error) {
      Alert.alert('Xəta', 'Hesabat göndərilə bilmədi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navigation = useNavigation<NavigationProp>();

  return (
    <>
      <TopHeader title="Yeni hesabat" />

      <View style={{padding: 20}}>
        <Text style={{fontSize: 18, marginBottom: 5}}>
          Problem növünü seçin
        </Text>
        <Picker
          selectedValue={selectedProblem}
          onValueChange={itemValue => setSelectedProblem(itemValue)}
          style={{borderWidth: 1, borderColor: '#ddd', marginBottom: 10}}>
          <Picker.Item label="Texniki problem seçin" value="" />
          {problemList?.map((problem: any) => (
            <Picker.Item
              key={problem.id}
              label={problem.description}
              value={problem.id}
            />
          ))}
        </Picker>

        <Text style={{fontSize: 18, marginBottom: 5}}> Terminal seçin</Text>
        {/* <Picker
          selectedValue={selectedTerminal}
          onValueChange={itemValue => setSelectedTerminal(itemValue)}
          style={{borderWidth: 1, borderColor: '#ddd', marginBottom: 10}}>
          <Picker.Item label="Select Terminal" value="" />
          {terminalList?.map((terminal: any) => (
            <Picker.Item
              key={terminal.id}
              label={terminal.name} // Adjust based on your terminal object
              value={terminal.id}
            />
          ))}
        </Picker> */}

        <Text style={{fontSize: 18, marginBottom: 10}}>
          Terminalın şəklini yükləyin *
        </Text>
        <View
          style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10}}>
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
            onPress={() =>
              Alert.alert(
                'Şəkil əlavə et',
                'Şəkli haradan əlavə etmək istəyirsiniz?',
                [
                  {text: 'Kamera', onPress: takePhoto},
                  {text: 'Qalereya', onPress: pickImageFromGallery},
                  {text: 'Ləğv et', style: 'cancel'},
                ],
              )
            }
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

        <Text style={{fontSize: 18, marginBottom: 10}}>Video əlavə edin</Text>
        <TouchableOpacity
          onPress={pickVideo}
          style={{
            width: 70,
            height: 70,
            backgroundColor: '#ddd',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
          }}>
          <Text style={{fontSize: 20}}>🎥</Text>
        </TouchableOpacity>

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

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" /> // Loading göstəricisi
        ) : (
          <TouchableOpacity onPress={handleSubmit} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Göndər</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default NewReportScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2D64AF',
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {fontSize: 18, fontWeight: 'bold', color: '#fff'},
  primaryButton: {
    backgroundColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
});
