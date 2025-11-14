import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {apiService} from '../services/apiService';
import TopHeader from '../components/TopHeader';
import {ImageIcon, VideoIcon} from '../assets/icons';
import VideoPickerModal from '../components/VideoPickerModal';
import FilePickerModal from '../components/FilePickerModal';
import CustomModal from '../components/Modal';
import UniversalSelectModal from '../components/UniversalSelectModal';
import CustomSelectBox from '../components/CustomSelectBox';
import {API_ENDPOINTS} from '../services/api_endpoint';
import {MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SvgImage} from '@components/SvgImage';

const NewReportScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.newReport>
> = ({navigation, route}) => {
  const terminalIdFromRoute = route.params?.terminalId;

  console.log(terminalIdFromRoute, 'terminalIdFromRoute');

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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [modalData, setModalData] = useState<
    {id: number | string; name: string}[]
  >([]);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    id: number | string;
    name: string;
  } | null>(null);
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(
    null,
  );
  const [selectedTerminalObj, setSelectedTerminalObj] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null,
  );
  const [selectedProblemObj, setSelectedProblemObj] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [modalType, setModalType] = useState<'problem' | 'terminal' | null>(
    null,
  );

  useEffect(() => {
    if (terminalIdFromRoute) {
      setSelectedTerminalId(terminalIdFromRoute);
    }
  }, [terminalIdFromRoute]);

  const takePhoto = () => {
    const options: any = {
      mediaType: 'photo',
      cameraType: 'back',
      quality: 1,
      saveToPhotos: true,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Xəta', 'Kamera açılmadı');
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setSelectedImages([...selectedImages, uri]);
      }
    });
  };

  const pickImageFromGallery = () => {
    const options: any = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Xəta', 'Şəkil seçilə bilmədi');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setSelectedImages([...selectedImages, uri]);
      }
    });
  };

  const pickVideoFromGallery = () => {
    const options: any = {
      mediaType: 'video',
      quality: 1,
      videoQuality: 'high',
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Xəta', 'Video seçilə bilmədi');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setSelectedVideos(prev => [...prev, uri]);
      }
    });
  };

  const recordVideo = () => {
    const options: any = {
      mediaType: 'video',
      quality: 1,
      videoQuality: 'high',
      durationLimit: 60, // Max 1 dəqiqə
      saveToPhotos: true,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Xəta', 'Video çəkilə bilmədi');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setSelectedVideos(prev => [...prev, uri]);
      }
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
        const data = await apiService.get(API_ENDPOINTS.mobile.terminal.getAll);
        console.log(data, 'data');
        setTerminalList(data);
      } catch (error) {
        setTerminalList([]);
        console.error('Terminals could not be fetched:', error);
      }
    };

    fetchTerminals();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.mobile.problem.getAll);
        console.log(data);
        setProblemList(data);
      } catch (error) {
        console.error('Problem siyahısı alınmadı:', error);
      }
    };

    fetchProblems();
  }, []);

  const handleSubmit = async () => {
    if (!selectedProblemId || !selectedProblemObj) {
      setModalMessage('Zəhmət olmasa problem növünü və uyğun terminalı seçin.');
      setIsModalVisible(true);
      return;
    }
    try {
      setLoading(true);

      const formData = new FormData();
      const terminalId = selectedTerminalId;

      formData.append('PointId', terminalId);
      formData.append('ProblemId', selectedProblemId);
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

      await apiService.postMultipart(
        API_ENDPOINTS.mobile.report.create,
        formData,
      );
      setSuccessModalVisible(true);
    } catch (error) {
      setModalMessage('Hesabat yaradılarkən xəta baş verdi.');
      setIsModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (terminalList.length && terminalIdFromRoute != null) {
      const matchedTerminal = terminalList.find(
        t => String(t.id) === String(terminalIdFromRoute),
      );
      if (matchedTerminal) {
        setSelectedTerminalId(matchedTerminal.pointId);
        setSelectedTerminalObj({
          id: matchedTerminal.id,
          name: String(matchedTerminal.pointId),
        });
      }
    }
  }, [terminalList, terminalIdFromRoute]);

  console.log(terminalList, 'tmrnl');
  return (
    <>
      <TopHeader title="Yeni hesabat" />
      <ScrollView
        style={{backgroundColor: '#fff'}}
        contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <CustomSelectBox
            label="Terminali seçin"
            placeholder="Terminal ID"
            value={selectedTerminalObj?.name}
            onPress={() => {
              const mapped =
                terminalList &&
                terminalList?.map(t => ({id: t?.pointId, name: t?.pointId}));
              setModalData(mapped || []);
              setModalTitle('Terminal seçin');
              setModalType('terminal');
              setSelectModalVisible(true);
            }}
            // error={!selectedTerminalId}
          />

          <CustomSelectBox
            label="Problem növü"
            placeholder="Problem"
            value={selectedProblemObj?.name}
            onPress={() => {
              const mapped =
                problemList &&
                problemList?.map(p => ({
                  id: p?.id,
                  name: p?.description,
                }));
              setModalData(mapped || []);
              setModalTitle('Problem növü');
              setModalType('problem');
              setSelectModalVisible(true);
            }}
            // error={!selectedProblemId}
          />
          <UniversalSelectModal
            visible={selectModalVisible}
            data={modalData}
            title={modalTitle}
            onClose={() => {
              setSelectModalVisible(false);
              setModalType(null);
            }}
            onSelect={(item: any) => {
              if (modalType === 'problem') {
                setSelectedProblemId(item.id);
                setSelectedProblemObj(item);
              } else if (modalType === 'terminal') {
                setSelectedTerminalId(item.id);
                setSelectedTerminalObj(item);
              }
              setSelectModalVisible(false);
              setModalType(null);
            }}
          />

          <Text style={styles.imageContentLabel}>
            Terminalın şəklini yükləyin *
          </Text>
          <View
            style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10}}>
            {selectedImages.map((image: any, index: any) => (
              <View key={index} style={{position: 'relative', marginRight: 5}}>
                <Image
                  source={{uri: image}}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 15,
                    backgroundColor: 'red',
                  }}
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
                    <SvgImage source={require('assets/icons/svg/x-icon.svg')} />
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
            multiline
            textAlignVertical="top"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.replace(Routes.home)}>
              <Text style={styles.secondaryButtonLabel}>Keç </Text>
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
          visible={isModalVisible}
          title="Xəta"
          description={modalMessage}
          onConfirm={() => setIsModalVisible(false)}
          confirmText="Bağla"
        />

        <CustomModal
          visible={isSuccessModalVisible}
          title="Bildiriş"
          description="Hesabatınız uğurla göndərildi."
          confirmText="Bağla"
          onConfirm={() => {
            setSuccessModalVisible(false);
            navigation.replace(Routes.reports);
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
            pickVideoFromGallery();
          }}
          onRecordVideo={() => {
            setVideoModalVisible(false);
            recordVideo();
          }}
        />
      </ScrollView>
    </>
  );
};

export default NewReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    gap: 10,
    paddingTop: 25,
    position: 'relative',
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
    height: 90,
    padding: 12,
    textAlignVertical: 'top',
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
    position: 'absolute',
    left: 20,
    bottom: 0,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    width: '49%',
    height: 48,
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
    height: 48,
  },
  secondaryButtonLabel: {
    color: '#1269B5',
    fontFamily: 'DM Sans',
    paddingHorizontal: 16,
    fontSize: 14,
  },
});
