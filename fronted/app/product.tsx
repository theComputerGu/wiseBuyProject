import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import itimtext from '../components/itimtext'
import BottomNavigation from '../components/bottomnavigation'
import Topnav from '../components/topnav'
export default function Product() {
  const [fontsLoaded] = useFonts({
    Itim_400Regular,
  });

  

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return <View style={styles.container} >  
  
  </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // pure white
  },
});
