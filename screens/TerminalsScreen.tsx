import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import TopHeader from '../components/TopHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import {LocationIcon, MapIcon, RoadIcon, TabletIcon} from '../assets/icons';
import {apiService} from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_ENDPOINTS} from '../services/api_endpoint';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';

const TerminallarScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.profileDetail>
> = ({navigation}) => {
  const [selectedTerminal, setSelectedTerminal] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [terminals, setTerminals] = useState<any[]>([]);

  const openModal = async (terminal: any) => {
    setSelectedTerminal(terminal);
    setModalVisible(true);

    try {
      const details: any = await apiService.get(
        API_ENDPOINTS.mobile.terminal.getById(terminal.id),
      );
      console.log(details, 'Terminal details');
      setSelectedTerminal(details);
    } catch (error) {
      console.error('Terminal details alınarkən xəta:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTerminal(null);
  };

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTerminals = async () => {
      setLoading(true);
      try {
        const roleName = await AsyncStorage.getItem('roleName');
        const token = await AsyncStorage.getItem('userToken');

        const data = await apiService.get(
          API_ENDPOINTS.mobile.terminal.getCollectorAreaTerminals,
        );

        setTerminals(data);
      } catch (error) {
        console.error('Terminals alınarkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerminals();
  }, []);

  const TerminalCard = ({terminal}: any) => (
    <TouchableOpacity onPress={() => openModal(terminal)}>
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.pgCircle}>
            <Text style={styles.pgText}>PG</Text>
            <View style={styles.dot} />
          </View>
          <View>
            <Text style={styles.terminalId}>
              Terminal ID – {terminal.pointId}
            </Text>
            <Text style={styles.infoText} />
          </View>
        </View>
        <View style={styles.right} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopHeader title="Terminallar" />

      <FlatList
        data={terminals}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item}) => <TerminalCard terminal={item} />}
        contentContainerStyle={{paddingBottom: 20}}
        ListEmptyComponent={
          <View style={styles.noResult}>
            <Image
              source={require('../assets/img/tasks_empty.png')}
              style={styles.noContentImage}
            />
            <Text style={styles.noContentLabel}>
              Heç bir terminal tapılmadı
            </Text>
            <Text style={styles.noContentText}>
              Bütün terminallar burada görünəcək.
            </Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.title}>Digər məlumatlar</Text>
              <TouchableOpacity onPress={closeModal}>
                <Icon name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: 'https://www.emanat.az/assets/images/923b2a79-2fc0-4e72-a668-3767bf309966.webp?w=1200&q=75?fm=webp',
                  }}
                  style={styles.image}
                />
                <Text style={styles.imageText}>terminal.jpg</Text>
                <Text style={styles.imageSize}>22.5 KB</Text>
              </View>
              <InfoItem
                icon={<TabletIcon color="#1269B5" />}
                label="Terminal ID"
                value={selectedTerminal?.pointId}
              />
              {/* <InfoItem icon={<AvatarIcon />} label="Şirkət" value="E-manat" /> */}
              <InfoItem
                icon={<MapIcon color="#1269B5" />}
                label="Bölgə"
                value="Bakı"
              />
              <InfoItem
                icon={<RoadIcon color="#1269B5" />}
                label="Ərazi"
                value="Nərimanov rayonu"
              />
              <InfoItem
                icon={<LocationIcon color="#1269B5" />}
                label="Ünvan"
                value={selectedTerminal?.address}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InfoItem = ({icon, label, value}: any) => (
  <View style={styles.infoItem}>
    {icon && <View style={styles.infoIcon}>{icon}</View>}
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pgCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  pgText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  terminalId: {
    color: '#1269B5',
    textAlign: 'right',
    fontFamily: 'DMSans-SemiBold', // və ya əlavə etdiyin font adı
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 21,
  },
  infoText: {
    color: '#616161',
    fontSize: 12,
  },
  right: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  fullnessBox: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  fullnessText: {
    color: '#43A047',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  noResult: {
    color: '#A8A8A8',
    fontSize: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
    height: '100%',
    paddingTop: 60,
  },
  noContentImage: {
    width: 150,
    height: 150,
  },
  noContentLabel: {
    color: '#063A66',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 24,
  },
  noContentText: {
    color: '#616161',
    textAlign: 'center',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  title: {
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 24, // 150% of 16px
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 80,
    height: 85,
    borderRadius: 8,
    marginBottom: 6,
  },
  imageText: {
    fontFamily: 'DMSans-SemiBold',
  },
  imageSize: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: '#777',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  infoLabel: {
    color: '#063A66', // Default color if --Primary-primary-800 is not defined
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 24, // 150% of 16px (16 * 1.5)
  },
  infoValue: {
    color: '#616161', // Default color if --Neutral-700 is not defined
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21, // 150% of 14px (14 * 1.5)
  },
});

export default TerminallarScreen;
