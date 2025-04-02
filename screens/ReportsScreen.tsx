import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconDoc from 'react-native-vector-icons/Ionicons';

const DATA = [
  {
    id: '1',
    title: '32kb',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '2',
    title: 'Terminal ID 2341',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '3',
    title: 'Terminal ID 4533',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '4',
    title: 'Terminal ID 0981',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '5',
    title: 'Terminal ID 0912',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
];

import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';

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

  const filteredData = DATA.filter(
    item =>
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.date.includes(searchText),
  );

  const renderItem = ({item}: any) => (
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
            {highlightText(item.title, searchText)}
          </Text>
          <Text style={styles.date}>
            {highlightText(item.date, searchText)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.time}>{item.time}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FILTER_OPTIONS = [
    'Cari ay',
    'Keçən həftə',
    'Keçən ay',
    'Cari il',
    'Keçən il',
    'Hamısı',
  ];

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const renderFilterOption = (option: string) => (
    <TouchableOpacity
      key={option}
      style={{flexDirection: 'row', alignItems: 'center', marginVertical: 5}}
      onPress={() => setSelectedFilters([option])}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: '#2D64AF',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}>
        {selectedFilters.includes(option) && (
          <Icon name="check" size={16} color="#2D64AF" />
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
        </View>
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

        {/* <Icon name="filter" /> */}
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
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
});
