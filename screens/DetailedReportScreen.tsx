import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  TextStyle,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useRoute} from '@react-navigation/native';
import {apiService} from '../services/apiService';
import {
  BriefCaseIcon,
  CalendarIcon,
  InfoIcon,
  NoteIcon,
  TabletIcon,
} from '../assets/icons';
import {API_ENDPOINTS} from '../services/api_endpoint';
import {Routes} from '@navigation/routes';
import {MainStackParamList} from 'types/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SvgImage} from '@components/SvgImage';
import Video from 'react-native-video';

const DetailedReportScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.detailedReport>
> = ({navigation}) => {
  const route: any = useRoute();
  const {report} = route.params;

  const [detailedReport, setDetailedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const fetchReportById = async () => {
      try {
        const data = await apiService.get(
          API_ENDPOINTS.mobile.report.getById(report.id),
        );
        setDetailedReport(data);
      } catch (error) {
        console.error('Hesabat detalları alınarkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportById();
  }, [report.id]);

  const renderDetail = (
    icon: any,
    label: string,
    value: string,
    valueStyle: TextStyle = {},
  ) => (
    <View style={styles.detailRow}>
      {icon}
      <View style={{flex: 1}}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, valueStyle]}>{value}</Text>
      </View>
    </View>
  );

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const openVideoModal = () => {
    setVideoModalVisible(true);
    setPaused(false);
  };

  const closeVideoModal = () => {
    setVideoModalVisible(false);
    setPaused(true);
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Gözləmədə';
      case 1:
        return 'Tamamlandı';
      default:
        return 'Naməlum';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const {top} = useSafeAreaInsets();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <Text>Yüklənir...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SvgImage
            source={require('assets/icons/svg/go-back.svg')}
            color="#2D64AF"
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Hesabat</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {renderDetail(
            <TabletIcon color="#1269B5" />,
            'Terminal ID',
            detailedReport?.terminal?.pointId?.toString() || 'N/A',
          )}
          {renderDetail(
            <BriefCaseIcon color="#1269B5" />,
            'Problemin növü',
            detailedReport?.problem?.description || 'N/A',
          )}
          {renderDetail(
            <CalendarIcon color="#1269B5" />,
            'Tarix',
            formatDate(detailedReport?.createdDate || report.createdDate),
          )}
          {renderDetail(
            <InfoIcon color="#1269B5" />,
            'Status',
            getStatusText(detailedReport?.reportStatus),
            {
              color: detailedReport?.reportStatus === 0 ? 'red' : '#29C0B9',
              fontWeight: 'bold',
              fontFamily: 'DMSans-Regular',
            },
          )}
          {renderDetail(
            <NoteIcon color="#1269B5" />,
            'Qeyd',
            detailedReport?.description || 'Qeyd yoxdur',
          )}

          {/* Şəkillər */}
          {detailedReport?.images && detailedReport.images.length > 0 && (
            <>
              <Text style={[styles.label, {marginTop: 20}]}>Şəkillər</Text>
              <FlatList
                data={detailedReport.images}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 10, marginTop: 10}}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => openModal(item.imageUrl)}>
                    <FastImage
                      source={{
                        uri: item.imageUrl,
                        priority: FastImage.priority.normal,
                      }}
                      style={styles.image}
                    />
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {detailedReport?.videoUrl && (
            <>
              <Text style={[styles.label, {marginTop: 20}]}>Video</Text>
              <TouchableOpacity
                style={styles.videoThumbnail}
                onPress={openVideoModal}>
                <View style={styles.playIconContainer}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
                <Text style={styles.videoText}>Videonu göstər</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Şəkil Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {selectedImage && (
                  <FastImage
                    source={{
                      uri: selectedImage,
                      priority: FastImage.priority.high,
                    }}
                    style={styles.modalImage}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Bağla</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={videoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeVideoModal}>
        <TouchableWithoutFeedback onPress={closeVideoModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.videoModalContent}>
                {detailedReport?.videoUrl && (
                  <Video
                    source={{uri: detailedReport.videoUrl}}
                    style={styles.videoPlayer}
                    controls={true}
                    paused={paused}
                    resizeMode="contain"
                    onError={error => {
                      if (__DEV__) console.log('Video xətası:', error);
                    }}
                  />
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeVideoModal}>
                  <Text style={styles.closeButtonText}>Bağla</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default DetailedReportScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 16},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    marginTop: 15,
  },
  headerText: {
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 26,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    shadowColor: '#d7dee6',
    shadowRadius: 9,
    elevation: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'DMSans-SemiBold',
    color: '#063A66',
    marginTop: 10,
    marginHorizontal: 10,
  },
  value: {
    fontSize: 14,
    color: '#616161',
    marginHorizontal: 10,
    marginVertical: 5,
    fontFamily: 'DMSans-Regular',
  },
  image: {width: 100, height: 100, borderRadius: 5},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  icon: {marginRight: 8},
  videoThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  playIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1269B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playIcon: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 3,
  },
  videoText: {
    color: '#1269B5',
    fontSize: 14,
    fontFamily: 'DMSans-SemiBold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#1269B5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    height: 48,
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginBottom: 10,
  },
  videoModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  videoPlayer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    backgroundColor: '#000',
  },
});
