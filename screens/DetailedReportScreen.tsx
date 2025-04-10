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
  Button,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';
import {apiService} from '../services/apiService';

const DetailedReportScreen = () => {
  const navigation = useNavigation();
  const route: any = useRoute();
  const {report} = route.params;

  const [detailedReport, setDetailedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportById = async () => {
      try {
        const data = await apiService.get(
          `/mobile/Report/GetById?id=${report.id}`,
        );
        setDetailedReport(data);
        console.log(data, 'detailedReport');
      } catch (error) {
        console.error('Hesabat detalları alınarkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportById();
  }, [report.id]);

  const renderDetail = (
    icon: string,
    label: string,
    value: string,
    valueStyle: TextStyle = {},
  ) => (
    <View style={styles.detailRow}>
      <Icon name={icon} size={20} color="#2D64AF" style={styles.icon} />
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, valueStyle]}>{value}</Text>
      </View>
    </View>
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const openModal = (image: any) => {
    setSelectedImage(image);
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
    const month = String(date.getMonth() + 1).padStart(2, '0'); // aylar 0-dan başlayır
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#2D64AF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Hesabat</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.card}>
        {renderDetail(
          'smartphone',
          'Terminal ID',
          detailedReport?.terminal?.code,
        )}
        {renderDetail(
          'alert-circle',
          'Problemin növü',
          detailedReport?.problem?.description,
        )}
        {renderDetail('calendar', 'Tarix', formatDate(report.createdDate))}
        {/* {renderDetail('user', 'Texniki işçi', 'Ali Əliyev')} */}
        {renderDetail('info', 'Status', getStatusText(detailedReport?.reportStatus), {
          color: detailedReport?.status === 0 ? 'red' : '#29C0B9',
          fontWeight: 'bold',
        })}
        {renderDetail('clipboard', 'Qeyd', detailedReport?.description)}

        <Text style={styles.label}>Terminal</Text>

        <View style={styles.staticImagesContainer}>
          {detailedReport?.images?.map((img: any, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => openModal({uri: img.imageUrl})}>
              <Image source={{uri: img.imageUrl}} style={styles.image} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Image
                source={selectedImage || require('../assets/img/araz.png')}
                style={styles.modalImage}
              />

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
  },
  headerText: {fontSize: 18, fontWeight: 'bold', color: '#2D64AF'},
  card: {backgroundColor: '#F9F9F9', borderRadius: 10, padding: 16},
  label: {fontSize: 14, fontWeight: 'bold', color: '#063A66', marginTop: 10},
  value: {fontSize: 14, color: '#616161', marginTop: 4},
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
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
});
