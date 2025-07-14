import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';

import moment from 'moment';
import {apiService} from '../services/apiService';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import TopHeader from '../components/TopHeader';
import {DownloadIcon} from '../assets/icons';
import {API_ENDPOINTS} from '../services/api_endpoint';

type NavigationProp = StackNavigationProp<RootStackParamList, 'YeniHesabat'>;

const ReportsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Cari ay');

  const highlightText = (
    text: string | number = '',
    highlight: string = '',
  ) => {
    const textString = String(text);
    const searchTerm = highlight.replace(/\D/g, '');
    if (!searchTerm) return textString;

    const parts = textString.split(new RegExp(`(${searchTerm})`, 'g'));

    return parts.map((part, idx) =>
      part === searchTerm ? (
        <Text key={idx} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        part
      ),
    );
  };

  const [reports, setReports] = useState<any>([]);

  const renderItem = ({item}: any) => {
    const formattedDate = moment(item.createdDate).format('MM/DD/YYYY');

    const reportStatus =
      item.reportStatus === 0 ? 'Gözləmədədir' : 'Tamamlanıb';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('HesabatEtrafli', {report: item})}>
        <View style={styles.card}>
          <DownloadIcon color="#1269B5" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {highlightText(item.pointId, searchText)}
            </Text>
            <Text style={styles.date}>
              {highlightText(formattedDate, searchText)}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.time}>{item.workingHours}</Text>
            <Text style={styles.status}>{reportStatus}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FILTER_OPTIONS = [
    'Cari ay',
    'Keçən həftə',
    'Keçən ay',
    'Cari il',
    'Keçən il',
    'Hamısı',
  ];

  const getDateFilterParam = (filter: string): number => {
    switch (filter) {
      case 'Cari ay':
        return 1; // CurrentMonth
      case 'Keçən həftə':
        return 2; // LastWeek
      case 'Keçən ay':
        return 3; // LastMonth
      case 'Cari il':
        return 4; // CurrentYear
      case 'Keçən il':
        return 5; // LastYear
      default:
        return 0; // None
    }
  };

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const selectedFilter = selectedFilters[0] || 'Hamısı';
      const dateFilterParam = getDateFilterParam(selectedFilter);

      const data = await apiService.get(
        API_ENDPOINTS.mobile.report.getAll(searchText, dateFilterParam),
      );

      setReports(data);
    } catch (error) {
      console.error('Reportlar alınarkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedFilters]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [searchText, selectedFilters]),
  );

  const renderFilterOption = (option: string) => (
    <TouchableOpacity
      key={option}
      style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}
      onPress={() => {
        setSelectedFilters([option]);
      }}>
      <View style={styles.checkBox}>
        {selectedFilters.includes(option) && (
          <Icon name="check" size={17} color="#2D64AF" />
        )}
      </View>
      <Text style={styles.filterOptionText}>{option}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TopHeader
          title="Hesabatlar"
          rightIconName="plus"
          onRightPress={() => navigation.navigate('YeniHesabat', {})}
        />

        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={18}
            color="#2D64AF"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Axtar..."
            placeholderTextColor="#2D64AF"
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon
                name="x"
                size={18}
                color="#2D64AF"
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
            <Icon
              name="filter"
              size={18}
              color="#2D64AF"
              style={styles.filterIcon}
            />
          </TouchableOpacity>
        </View>

        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          onSwipeComplete={() => setModalVisible(false)}
          swipeDirection="down"
          style={{justifyContent: 'flex-end', margin: 0}}
          backdropTransitionOutTiming={0}
          animationOutTiming={700}>
          <View style={styles.modalContent}>
            <View style={styles.line}></View>
            {FILTER_OPTIONS.map(option => renderFilterOption(option))}
            <View style={{alignItems: 'center', marginVertical: 20}}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setModalVisible(false);
                  fetchReports();
                }}>
                <Text style={styles.buttonText}>Tətbiq et</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#2D64AF" />
          </View>
        ) : reports.length > 0 ? (
          <FlatList
            data={reports}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noResult}>
            <Image
              source={require('../assets/img/report_empty.png')}
              style={styles.noContentImage}
            />
            <Text style={styles.noContentLabel}>
              Sizin heç bir hesabatınız yoxdur
            </Text>
            <Text style={styles.noContentText}>
              Yeni hesabat yaratmaq üçün aşağıdakı düyməyə klikləyin.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('YeniHesabat', {})}>
              <Icon name="plus" size={24} color="#fff" />
              <Text style={styles.buttonText}>Yeni hesabat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F7F9FB'},
  header: {
    backgroundColor: '#2D64AF',
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {fontSize: 18, fontWeight: 'bold', color: '#fff'},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    margin: 10,
    paddingHorizontal: 10,
    fontFamily: 'DMSans-Regular',
    borderRadius: 10,
    marginVertical: 15,
    justifyContent: 'space-between',
  },
  filterIcon: {
    marginLeft: 10,
  },

  input: {
    fontSize: 14,
    color: '#2D64AF',
    flex: 1,
    height: 40,
    fontFamily: 'DMSans-Regular',
  },
  searchIcon: {marginRight: 10},
  clearIcon: {marginLeft: 10},
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 90,
    gap: 10,
  },
  icon: {marginRight: 10, marginTop: 5},
  textContainer: {flex: 1},
  title: {
    color: '#1269B5',
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 18,
  },
  date: {
    color: '#616161',
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    fontStyle: 'normal',
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: '#A8A8A8',
    textAlign: 'right',
    fontFamily: 'DMSans-Regular',
  },
  status: {
    fontSize: 12,
    color: '#29C0B9',
    fontFamily: 'DMSans-Regular',
  },
  statusContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 5,
  },
  highlight: {backgroundColor: '#D5E8F9'},
  noResult: {
    color: '#A8A8A8',
    fontSize: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 5,
    width: '100%',
    height: '100%',
    paddingTop: 85,
    paddingHorizontal: 50,
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

  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },

  applyButton: {
    borderRadius: 8,
    backgroundColor: '#1269B5',
    flexDirection: 'column',
    width: '100%',
    height: 48,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#1269B5',
    flexDirection: 'row',
    width: 160,
    height: 48,
    minWidth: 128,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
  filterOptionText: {
    color: '#424242',
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
  },
  checkBox: {
    width: 20, // Increase width
    height: 20, // Increase height
    borderRadius: 5,
    borderWidth: 1, // Slightly thicker border
    borderColor: '#75ACDA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF8FF',
    marginRight: 10,
  },
  line: {
    borderRadius: 108,
    backgroundColor: '#B9C0C9',
    width: 94,
    height: 6,
    flexShrink: 0,
    alignSelf: 'center',
  },
});
