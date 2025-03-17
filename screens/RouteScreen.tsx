// import {StyleSheet, Text, View, Button, Linking, Alert} from 'react-native';
// import React from 'react';
// import MapView, {Marker} from 'react-native-maps';
// const RouteScreen = () => {
//   const openWaze = () => {
//     const latitude = 40.3729;
//     const longitude = 49.8485;

//     const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

//     Linking.openURL(wazeUrl).catch(() =>
//       Alert.alert(
//         'Xəta',
//         'Waze açmaq mümkün olmadı. Zəhmət olmasa, Waze tətbiqini yükləyin!',
//       ),
//     );
//   };

//   return (
//     <>
//       <View style={styles.container}>
//         <Text style={styles.title}>Marşrut səhifəsi</Text>
//         <Button title="Waze ilə aç" onPress={openWaze} />
//       </View>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: 40.4093,
//           longitude: 49.8671,
//           latitudeDelta: 0.0922,
//           longitudeDelta: 0.0421,
//         }}>
//         <Marker
//           coordinate={{latitude: 40.4093, longitude: 49.8671}}
//           title="Bakı"
//           description="Azərbaycanın paytaxtı"
//         />
//       </MapView>
//     </>
//   );
// };

// export default RouteScreen;

// const styles = StyleSheet.create({
//   container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
//   title: {fontSize: 24, marginBottom: 20},
//   map: {
//     flex: 1,
//   },
// });

import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const RouteScreen = () => {
  return (
    <View>
      <Text>RouteScreen</Text>
    </View>
  );
};

export default RouteScreen;

const styles = StyleSheet.create({});
