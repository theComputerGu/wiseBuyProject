import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import FontText from '../components/itimtext'; // ✅ correct import name
import Logo from '../assets/logos/logo white.png';

const screenHeight = Dimensions.get('window').height;

export default function Index() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Itim_400Regular,
  });

  // ✅ Navigate automatically after 3 seconds
  useEffect(() => {
    if (!fontsLoaded) return;

    const timer = setTimeout(() => {
      router.replace('/historyscreen'); // replace = no back navigation
    }, 3000);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.img} />
      <FontText size={28} color="#fff" weight="bold">WiseBuy</FontText>
      <FontText size={20} color="#fff">Shop smart. Stock right.</FontText>
      <FontText size={20} color="#fff">Save big.</FontText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#197FF4',
    justifyContent: 'center',
  },
  center: {
    justifyContent: 'center',
  },
  img: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: screenHeight * 0.05,
  },
});
