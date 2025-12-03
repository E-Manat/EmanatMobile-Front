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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  CameraOptions,
  ImageLibraryOptions,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
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
import {
  request,
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
} from 'react-native-permissions';

const NewReportScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.newReport>
> = ({navigation, route}) => {
  const terminalIdFromRoute = route.params?.terminalId;
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [problemList, setProblemList] = useState<any[]>([]);
  const [terminalList, setTerminalList] = useState<any[]>([]);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [modalData, setModalData] = useState<
    {id: number | string; name: string}[]
  >([]);
  const [modalTitle, setModalTitle] = useState('');
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
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      try {
        const [terminals, problems] = await Promise.all([
          apiService.get(API_ENDPOINTS.mobile.terminal.getAll),
          apiService.get(API_ENDPOINTS.mobile.problem.getAll),
        ]);
        setTerminalList(terminals);
        setProblemList(problems);

        if (terminalIdFromRoute && terminals.length) {
          const matchedTerminal = terminals.find(
            (t: any) => String(t.id) === String(terminalIdFromRoute),
          );
          if (matchedTerminal) {
            setSelectedTerminalId(matchedTerminal.pointId);
            setSelectedTerminalObj({
              id: matchedTerminal.id,
              name: String(matchedTerminal.pointId),
            });
          }
        }
      } catch (error) {
        console.error('Data fetch error:', error);
        setTerminalList([]);
        setProblemList([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, [terminalIdFromRoute]);

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
          Alert.alert(
            'İcazə tələb olunur',
            'Kamera istifadə etmək üçün Parametrlər > eManat > Kamera bölməsindən icazə verin',
            [
              {text: 'Ləğv et', style: 'cancel'},
              {text: 'Parametrlərə keç', onPress: () => openSettings()},
            ],
          );
          return false;
        }
        return result === RESULTS.GRANTED;
      } else {
        const cameraResult = await check(PERMISSIONS.IOS.CAMERA);

        if (cameraResult === RESULTS.DENIED) {
          const requestResult = await request(PERMISSIONS.IOS.CAMERA);
          return requestResult === RESULTS.GRANTED;
        }

        if (cameraResult === RESULTS.BLOCKED) {
          Alert.alert(
            'İcazə tələb olunur',
            'Kamera istifadə etmək üçün Parametrlər > eManat > Kamera bölməsindən icazə verin',
            [
              {text: 'Ləğv et', style: 'cancel'},
              {text: 'Parametrlərə keç', onPress: () => openSettings()},
            ],
          );
          return false;
        }

        return cameraResult === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const requestPhotoLibraryPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
          Alert.alert(
            'İcazə tələb olunur',
            'Qalereya istifadə etmək üçün Parametrlər > eManat > Foto və videolar bölməsindən icazə verin',
            [
              {text: 'Ləğv et', style: 'cancel'},
              {text: 'Parametrlərə keç', onPress: () => openSettings()},
            ],
          );
          return false;
        }
        return result === RESULTS.GRANTED;
      } else {
        const photoResult = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

        if (photoResult === RESULTS.DENIED) {
          const requestResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          if (requestResult === RESULTS.BLOCKED) {
            Alert.alert(
              'İcazə tələb olunur',
              'Qalereya istifadə etmək üçün Parametrlər > eManat > Fotolar bölməsindən icazə verin',
              [
                {text: 'Ləğv et', style: 'cancel'},
                {text: 'Parametrlərə keç', onPress: () => openSettings()},
              ],
            );
            return false;
          }
          return (
            requestResult === RESULTS.GRANTED ||
            requestResult === RESULTS.LIMITED
          );
        }

        if (photoResult === RESULTS.BLOCKED) {
          Alert.alert(
            'İcazə tələb olunur',
            'Qalereya istifadə etmək üçün Parametrlər > eManat > Fotolar bölməsindən icazə verin',
            [
              {text: 'Ləğv et', style: 'cancel'},
              {text: 'Parametrlərə keç', onPress: () => openSettings()},
            ],
          );
          return false;
        }

        return (
          photoResult === RESULTS.GRANTED || photoResult === RESULTS.LIMITED
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const getFileName = (uri: string): string => {
    return uri.split('/').pop() || uri;
  };

  const isDuplicateImage = (newUri: string): boolean => {
    const newFileName = getFileName(newUri);
    return selectedImages.some(
      existingUri => getFileName(existingUri) === newFileName,
    );
  };

  const isDuplicateVideo = (newUri: string): boolean => {
    const newFileName = getFileName(newUri);
    return selectedVideos.some(
      existingUri => getFileName(existingUri) === newFileName,
    );
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('İcazə', 'Kamera istifadə etmək üçün icazə verin');
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
      saveToPhotos: false,
      includeBase64: false,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Xəta', response.errorMessage || 'Kamera açılmadı');
        console.log('Camera error:', response.errorCode, response.errorMessage);
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        if (isDuplicateImage(uri)) {
          Alert.alert('Xəta', 'Bu şəkil artıq əlavə edilib');
          return;
        }
        setSelectedImages(prev => [...prev, uri]);
      }
    });
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      Alert.alert('İcazə', 'Qalereya istifadə etmək üçün icazə verin');
      return;
    }

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Xəta', response.errorMessage || 'Şəkil seçilə bilmədi');
        console.log(
          'Gallery error:',
          response.errorCode,
          response.errorMessage,
        );
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        if (isDuplicateImage(uri)) {
          Alert.alert('Xəta', 'Bu şəkil artıq əlavə edilib');
          return;
        }
        setSelectedImages(prev => [...prev, uri]);
      }
    });
  };

  const pickVideoFromGallery = async () => {
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      Alert.alert('İcazə', 'Qalereya istifadə etmək üçün icazə verin');
      return;
    }

    const options: ImageLibraryOptions = {
      mediaType: 'video',
      quality: 0.8,
      videoQuality: 'high',
      selectionLimit: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Xəta', response.errorMessage || 'Video seçilə bilmədi');
        console.log('Video error:', response.errorCode, response.errorMessage);
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        if (isDuplicateVideo(uri)) {
          Alert.alert('Xəta', 'Bu video artıq əlavə edilib');
          return;
        }
        setSelectedVideos(prev => [...prev, uri]);
      }
    });
  };

  const recordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('İcazə', 'Kamera istifadə etmək üçün icazə verin');
      return;
    }

    const options: CameraOptions = {
      mediaType: 'video',
      quality: 0.8,
      videoQuality: 'high',
      durationLimit: 60,
      saveToPhotos: false,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Xəta', response.errorMessage || 'Video çəkilə bilmədi');
        console.log(
          'Video record error:',
          response.errorCode,
          response.errorMessage,
        );
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        if (isDuplicateVideo(uri)) {
          Alert.alert('Xəta', 'Bu video artıq əlavə edilib');
          return;
        }
        setSelectedVideos(prev => [...prev, uri]);
      }
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedTerminalId || !selectedTerminalObj) {
      setModalMessage('Zəhmət olmasa terminal seçin.');
      setIsModalVisible(true);
      return;
    }

    if (!selectedProblemId || !selectedProblemObj) {
      setModalMessage('Zəhmət olmasa problem növünü seçin.');
      setIsModalVisible(true);
      return;
    }

    if (!comment.trim()) {
      setModalMessage('Zəhmət olmasa şərh əlavə edin.');
      setIsModalVisible(true);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      const terminalId = selectedTerminalId;

      formData.append('PointId', terminalId);
      formData.append('ProblemId', selectedProblemId);
      formData.append('Description', comment.trim());

      selectedImages.forEach((uri, index) => {
        formData.append('Images', {
          uri,
          name: `image_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      selectedVideos.forEach((uri, index) => {
        formData.append('Video', {
          uri,
          name: `video_${index}.mp4`,
          type: 'video/mp4',
        } as any);
      });

      await apiService.postMultipart(
        API_ENDPOINTS.mobile.report.create,
        formData,
      );
      setSuccessModalVisible(true);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Hesabat yaradılarkən xəta baş verdi.';
      setModalMessage(errorMessage);
      setIsModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <>
        <TopHeader title="Yeni hesabat" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1269B5" />
          <Text style={styles.loadingText}>Məlumatlar yüklənir...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <TopHeader title="Yeni hesabat" />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <CustomSelectBox
              label="Terminali seçin *"
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
            />

            <CustomSelectBox
              label="Problem növü *"
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
              Terminalın şəklini yükləyin
            </Text>
            <View style={styles.imageContainer}>
              {selectedImages.map((image, index) => (
                <View
                  key={`img-${index}-${getFileName(image)}`}
                  style={styles.imageWrapper}>
                  <Image source={{uri: image}} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(index)}>
                    <SvgImage
                      style={{alignSelf: 'center'}}
                      source={require('assets/icons/svg/x-icon.svg')}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setImageModalVisible(true)}
                style={styles.imageContent}>
                <ImageIcon color="#1269B5" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setVideoModalVisible(true)}
              style={styles.videoContent}>
              <VideoIcon />
              <View>
                <Text style={styles.videoContentText}>Video əlavə et</Text>
                <Text style={styles.videoContentTextSize}>Max 10 MB</Text>
              </View>
            </TouchableOpacity>

            {selectedVideos.length > 0 && (
              <View style={styles.videoContainer}>
                {selectedVideos.map((videoUri, index) => (
                  <View
                    key={`vid-${index}-${getFileName(videoUri)}`}
                    style={styles.videoWrapper}>
                    <Image
                      source={{uri: videoUri}}
                      style={styles.videoPreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeVideo(index)}>
                      <SvgImage
                        source={require('assets/icons/svg/x-icon.svg')}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

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
                onPress={() => {
                  navigation.navigate(Routes.home, {
                    screen: 'Hesabatlar',
                  });
                }}>
                <Text style={styles.secondaryButtonLabel}>Keç</Text>
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
      </KeyboardAvoidingView>
    </>
  );
};

export default NewReportScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'DMSans-Regular',
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
    lineHeight: 21,
    fontStyle: 'normal',
    marginTop: 10,
  },
  noteInput: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    fontFamily: 'DMSans-Regular',
    height: 90,
    padding: 12,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  videoContent: {
    display: 'flex',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: '#F6F6F6',
    borderColor: '#E5E5E5',
    marginTop: 10,
  },
  videoContentText: {
    color: '#333',
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 20,
    marginLeft: 10,
  },
  videoContentTextSize: {
    color: '#666',
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 15,
    marginLeft: 10,
  },
  imageContentLabel: {
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 21,
    marginTop: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  imagePreview: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
  },
  imageContent: {
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  videoWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  videoPreview: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#2D64AF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    overflow: 'hidden',
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
    marginTop: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    width: '48%',
    height: 48,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1269B5',
    width: '48%',
    height: 48,
    justifyContent: 'center',
  },
  secondaryButtonLabel: {
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold',
    paddingHorizontal: 16,
    fontSize: 14,
  },
});
