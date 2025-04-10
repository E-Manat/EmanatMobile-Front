// import {useRoute} from '@react-navigation/native';
// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {apiService} from '../services/apiService';
// import {useNavigation} from '@react-navigation/native';
// import {RootStackParamList} from '../App';
// import {StackNavigationProp} from '@react-navigation/stack';
// type NavigationProp = StackNavigationProp<RootStackParamList, 'Hesabatlar'>;
// const RouteScreen = () => {
//   const route: any = useRoute();
//   const paramTaskId = route.params?.taskId;
//   const [taskId, setTaskId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const navigation = useNavigation<NavigationProp>();

//   useEffect(() => {
//     const loadTaskId = async () => {
//       if (paramTaskId) {
//         setTaskId(paramTaskId.toString());
//       } else {
//         const storedId = await AsyncStorage.getItem('taskId');
//         if (storedId) {
//           setTaskId(storedId);
//         }
//       }
//       setLoading(false);
//     };
//     loadTaskId();
//   }, [paramTaskId]);

//   const handleStartCollection = async () => {
//     try {
//       // if (!taskId) {
//       //   Alert.alert('Xəta', 'Task ID tapılmadı');
//       //   return;
//       // }
//       // const response = await apiService.post(
//       //   '/mobile/CollectorTask/StartCollection',
//       //   {taskId},
//       // );
//       // Alert.alert('Uğur', 'İnkassasiya başlandı!');
//       // console.log('Cavab:', response);
//       // 👇 TaskProcess səhifəsinə yönləndir
//       // navigation.navigate('TaskProcess');
//     } catch (error: any) {
//       console.error('Başlama xətası:', error);
//       Alert.alert('Xəta', error?.message || 'Xəta baş verdi');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Step Dots and Info */}
//       <View style={styles.routeContainer}>
//         <View style={styles.lineContainer}>
//           <Icon name="circle" size={14} color="#0057FF" />
//           <View style={styles.verticalLine} />
//           <Icon
//             name="map-marker"
//             size={18}
//             color="#FF9E00"
//             style={{marginTop: 5}}
//           />
//         </View>

//         <View style={styles.infoContainer}>
//           <View style={styles.stop}>
//             <Text style={styles.stopTitle}>Nizami mst</Text>
//             <Text style={styles.stopAddress}>
//               Zivər bəy Əhmədbəyov, Bakı, Yasamal
//             </Text>
//           </View>

//           <View style={styles.stop}>
//             <Text style={[styles.stopTitle, {color: '#FF9E00'}]}>28 Mall</Text>
//             <Text style={styles.stopAddress}>
//               Azadlıq avenu 15a/4 Baku AZ, Bakı
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Info Cards */}
//       <View style={styles.detailRow}>
//         <View style={styles.infoBox}>
//           <Text style={styles.infoTitle}>Məsafə</Text>
//           <Text style={styles.infoValue}>2.9 km</Text>
//         </View>
//         <View style={styles.infoBox}>
//           <Text style={styles.infoTitle}>Açıq saatları</Text>
//           <Text style={styles.infoValue}>08:00-23:00</Text>
//         </View>
//         <View style={styles.infoBox}>
//           <Text style={styles.infoTitle}>Əlaqə nömrəsi</Text>
//           <Text style={styles.infoValue}>055-515-85-01</Text>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={styles.primaryButton}
//         onPress={handleStartCollection}>
//         <Text style={styles.primaryText}>İnkassasiyaya başla</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.secondaryButton}>
//         <Text style={styles.secondaryText}>Marşrutu göstər</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default RouteScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//   },
//   routeContainer: {
//     flexDirection: 'row',
//     marginBottom: 30,
//   },
//   lineContainer: {
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   verticalLine: {
//     width: 2,
//     height: 30,
//     backgroundColor: '#ccc',
//     marginVertical: 2,
//   },
//   infoContainer: {
//     flex: 1,
//   },
//   stop: {
//     marginBottom: 15,
//   },
//   stopTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#001D45',
//   },
//   stopAddress: {
//     color: '#999',
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 25,
//   },
//   infoBox: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   infoTitle: {
//     fontSize: 14,
//     color: '#001D45',
//     marginBottom: 4,
//   },
//   infoValue: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   primaryButton: {
//     backgroundColor: '#0057FF',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   primaryText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   secondaryButton: {
//     borderWidth: 1,
//     borderColor: '#0057FF',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   secondaryText: {
//     color: '#0057FF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });
