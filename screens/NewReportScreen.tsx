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
  ScrollView,
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
import {ImageIcon, VideoIcon} from '../assets/icons';
import VideoPickerModal from '../components/VideoPickerModal';
import FilePickerModal from '../components/FilePickerModal';
import CustomModal from '../components/Modal';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const NewReportScreen = () => {
  const [selectedTerminal, setSelectedTerminal] = useState('');
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedImages, setSelectedImages] = useState<any>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [problemList, setProblemList] = useState<any[]>([]);
  const [terminalList, setTerminalList] = useState<any[]>([]);

  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);

  const [problemError, setProblemError] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  const navigation = useNavigation<NavigationProp>();

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
    Alert.alert('Video əlavə et', 'Videonu haradan əlavə etmək istəyirsiniz?', [
      {
        text: 'Kamera',
        onPress: () => {
          launchCamera({mediaType: 'video', quality: 1}, response => {
            const uri = response.assets?.[0]?.uri;
            if (uri) setSelectedVideos(prev => [...prev, uri]);
          });
        },
      },
      {
        text: 'Qalereya',
        onPress: () => {
          launchImageLibrary({mediaType: 'video', quality: 1}, response => {
            const uri = response.assets?.[0]?.uri;
            if (uri) setSelectedVideos(prev => [...prev, uri]);
          });
        },
      },
      {text: 'Ləğv et', style: 'cancel'},
    ]);
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
      const terminalId = selectedTerminal;

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
      setSuccessModalVisible(true);
    } catch (error) {
      Alert.alert('Xəta', 'Hesabat göndərilə bilmədi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopHeader title="Yeni hesabat" />
      <ScrollView style={{backgroundColor: '#fff'}}>
        <View style={styles.container}>
          <Text style={styles.selectLabel}>Problem növünü seçin</Text>
          <Picker
            selectedValue={selectedProblem}
            onValueChange={itemValue => setSelectedProblem(itemValue)}
            style={[styles.customPicker, problemError && {borderColor: 'red'}]}>
            <Picker.Item
              label="Texniki problem"
              value=""
              style={styles.customPickerLabel}
            />
            {problemList?.map((problem: any) => (
              <Picker.Item
                key={problem.id}
                label={problem.description}
                value={problem.id}
                style={styles.customPickerLabel}
              />
            ))}
          </Picker>

          <Text style={styles.selectLabel}> Terminal seçin</Text>
          <Picker
            selectedValue={selectedTerminal}
            onValueChange={itemValue => setSelectedTerminal(itemValue)}
            style={styles.customPicker}>
            <Picker.Item
              label="Terminal "
              value=""
              style={styles.customPickerLabel}
            />
            {terminalList?.map((terminal: any) => (
              <Picker.Item
                key={terminal.id}
                label={terminal.code}
                value={terminal.id}
                style={styles.customPickerLabel}
              />
            ))}
          </Picker>

          <Text style={styles.imageContentLabel}>
            Terminalın şəklini yükləyin *
          </Text>
          <View
            style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10}}>
            {selectedImages.map((image: any, index: any) => (
              <View key={index} style={{position: 'relative', marginRight: 5}}>
                <Image
                  source={{uri: image}}
                  style={{width: 70, height: 70, borderRadius: 15}}
                />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}>
                  <Text style={{color: 'white', fontSize: 12}}>
                    <Icon name="x" />
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setImageModalVisible(true)}
              style={styles.imageContent}>
              <Text>
                <ImageIcon color="#1269B5" />
              </Text>
            </TouchableOpacity>{' '}
          </View>

          <TouchableOpacity
            onPress={() => setVideoModalVisible(true)}
            style={styles.videoContent}>
            <VideoIcon />
            <View>
              <Text style={styles.videoContentText}>Video əlavə et *</Text>
              <Text style={styles.videoContentTextSize}>Max 20 MB</Text>
            </View>
          </TouchableOpacity>

          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {selectedVideos.map((videoUri, index) => (
              <View
                key={index}
                style={{
                  position: 'relative',
                  marginRight: 5,
                  marginBottom: 10,
                }}>
                <Image
                  source={{uri: videoUri}}
                  style={{width: 70, height: 70, borderRadius: 15}}
                />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => {
                    const updatedVideos = selectedVideos.filter(
                      (_, i) => i !== index,
                    );
                    setSelectedVideos(updatedVideos);
                  }}>
                  <Text style={{color: 'white', fontSize: 12}}>
                    {' '}
                    <Icon name="x" />
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.noteLabel}>Şərh əlavə edin *</Text>
          <TextInput
            placeholder="Şərhinizi bura yazın..."
            style={styles.noteInput}
            value={comment}
            onChangeText={setComment}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.replace('Ana səhifə')}>
              <Text style={styles.secondaryButtonLabel}>Çıxış et</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.primaryButton}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Göndər</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <CustomModal
          visible={isSuccessModalVisible}
          title="Bildiriş"
          description="Hesabatınız uğurla göndərildi."
          confirmText="Bağla"
          onConfirm={() => {
            setSuccessModalVisible(false);
            navigation.replace('Hesabatlar');
          }}
        />

        <FilePickerModal
          visible={isImageModalVisible}
          onClose={() => setImageModalVisible(false)}
          onPickGallery={() => {
            setImageModalVisible(false);
            pickImageFromGallery();
          }}
          onPickFile={() => {
            setImageModalVisible(false);
            Alert.alert('Qeyd', 'Bu funksiya hələlik aktiv deyil.');
          }}
          onTakePhoto={() => {
            setImageModalVisible(false);
            takePhoto();
          }}
        />
        <VideoPickerModal
          visible={isVideoModalVisible}
          onClose={() => setVideoModalVisible(false)}
          onPickGallery={() => {
            setVideoModalVisible(false);
            pickVideo();
          }}
          onPickFile={() => {
            setVideoModalVisible(false);
            Alert.alert('Qeyd', 'Bu funksiya hələlik aktiv deyil.');
          }}
          onRecordVideo={() => {
            setVideoModalVisible(false);
          }}
        />
      </ScrollView>
    </>
  );
};

export default NewReportScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    height: '100%',
    gap: 10,
    paddingTop: 25,
  },
  header: {
    backgroundColor: '#2D64AF',
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {fontSize: 18, fontWeight: 'bold', color: '#fff'},

  noteLabel: {
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21, // 150% of 14px
    fontStyle: 'normal',
  },
  noteInput: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    fontFamily: 'DMSans-Regular',
    height: 68,
  },
  videoContent: {
    display: 'flex',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',

    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: '#F6F6F6',
    borderColor: '#E5E5E5',
  },
  videoContentText: {
    color: '#333',
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 20, // 125% of 16px
  },
  videoContentTextSize: {
    color: '#666',
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 15,
  },
  imageContentLabel: {
    color: '#063A66', // var(--Primary-primary-800, #063A66)
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 21, // 150% of 14px
  },
  imageContent: {
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#2D64AF',
    borderRadius: 12,
    width: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  customPicker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#1269B5',
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16,
    color: '#333',
    fontFamily: 'DMSans-Medium',
    overflow: 'hidden', // Bu vacibdir!
  },
  customPickerLabel: {
    fontFamily: 'DMSans-Medium',
    borderRadius: 8,
  },
  selectLabel: {
    color: '#424242',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 12,
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    width: '49%',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1269B5',
    width: '49%',
  },
  secondaryButtonLabel: {
    color: '#1269B5',
    fontFamily: 'DM Sans',
    paddingHorizontal: 16,
    fontSize: 14,
  },
});
