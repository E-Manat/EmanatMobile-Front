import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  TextStyle,
} from 'react-native';
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

const DetailedReportScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.detailedReport>
> = ({navigation}) => {
  const route: any = useRoute();
  const {report} = route.params;

  const [detailedReport, setDetailedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      <View>
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

      <View style={styles.card}>
        {renderDetail(
          <TabletIcon color="#1269B5" />,
          'Terminal ID',
          detailedReport?.terminal?.pointId,
        )}
        {renderDetail(
          <BriefCaseIcon color="#1269B5" />,
          'Problemin növü',
          detailedReport?.problem?.description,
        )}
        {renderDetail(
          <CalendarIcon color="#1269B5" />,
          'Tarix',
          formatDate(report.createdDate),
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
          detailedReport?.description,
        )}

        <Text style={styles.label}>Terminal</Text>

        <FlatList
          data={detailedReport?.images}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: 10, marginTop: 10}}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => openModal(item.imageUrl)}>
              <Image source={{uri: item.imageUrl}} style={styles.image} />
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              {selectedImage && (
                <Image
                  source={{uri: selectedImage}}
                  style={styles.modalImage}
                />
              )}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Bağla</Text>
              </TouchableOpacity>
            </View>
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
  detailRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  icon: {marginRight: 8},
  staticImagesContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    width: '80%',
    height: '60%',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
});
