import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
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
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconDoc from 'react-native-vector-icons/Ionicons';

import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {apiService} from '../services/apiService';
type NavigationProp = StackNavigationProp<RootStackParamList, 'Hesabatlar'>;

const ReportsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Cari ay');

  const highlightText = (text: any, highlight: any) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part: any, index: any) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <Text key={index} style={styles.highlight}>
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
          <IconDoc
            name="document-outline"
            size={24}
            color="#2D64AF"
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {highlightText(item.code, searchText)}
            </Text>
            <Text style={styles.date}>
              {highlightText(formattedDate, searchText)}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.time}>{item.id}</Text>
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
        `/mobile/Report/GetAll?Search=${searchText}&DateFilter=${dateFilterParam}`,
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

  const renderFilterOption = (option: string) => (
    <TouchableOpacity
      key={option}
      style={{flexDirection: 'row', alignItems: 'center', marginVertical: 5}}
      onPress={() => {
        setSelectedFilters([option]);
      }}>
      <View
        style={{
          width: 30, // Increase width
          height: 30, // Increase height
          borderRadius: 5,
          borderWidth: 2, // Slightly thicker border
          borderColor: '#2D64AF',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}>
        {selectedFilters.includes(option) && (
          <Icon name="check" size={20} color="#2D64AF" />
        )}
      </View>
      <Text style={{color: '#000', fontSize: 16}}>{option}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Hesabatlar</Text>
          <View style={{width: 24}} />
        </View>

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
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => null}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Filtrlə</Text>

                  {FILTER_OPTIONS.map(option => renderFilterOption(option))}

                  <View style={{alignItems: 'center', marginVertical: 20}}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#2D64AF',
                        paddingVertical: 10,
                        paddingHorizontal: 30,
                        borderRadius: 10,
                      }}
                      onPress={() => {
                        fetchReports();
                        setModalVisible(false);
                      }}>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        Təsdiq et
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={{alignItems: 'center', marginVertical: 20}}>
          <TouchableOpacity
            style={{
              backgroundColor: '#2D64AF',
              paddingVertical: 10,
              paddingHorizontal: 30,
              borderRadius: 10,
            }}
            onPress={() => navigation.navigate('YeniHesabat')}>
            <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
              Yeni Hesabat
            </Text>
          </TouchableOpacity>
        </View>

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
          <Text style={styles.noResult}>Nəticə tapılmadı</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
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
    borderRadius: 10,
    marginVertical: 15,
    justifyContent: 'space-between', // Ensures icons and input are spaced well
  },
  filterIcon: {
    marginLeft: 10, // Space between the search input and filter icon
  },

  input: {fontSize: 14, color: '#2D64AF', flex: 1, height: 40},
  searchIcon: {marginRight: 10},
  clearIcon: {marginLeft: 10},
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: 90,
  },
  icon: {marginRight: 10, marginTop: 5},
  textContainer: {flex: 1},
  title: {fontWeight: '600', fontSize: 16, color: '#2D64AF'},
  date: {fontSize: 12, color: '#A8A8A8'},
  time: {fontSize: 12, color: '#A8A8A8', fontWeight: '400', textAlign: 'right'},
  status: {fontSize: 12, fontWeight: 'bold', color: '#29C0B9'},
  statusContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 5,
  },
  highlight: {backgroundColor: '#FFC107'},
  noResult: {
    textAlign: 'center',
    color: '#A8A8A8',
    fontSize: 16,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D64AF',
    marginBottom: 15,
  },

  applyButton: {
    marginTop: 20,
    backgroundColor: '#2D64AF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
