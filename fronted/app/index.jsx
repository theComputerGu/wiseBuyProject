import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  Button,
} from 'react-native';
import { useRouter } from 'expo-router'; // ✅ import router
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';

import Logo from '../assets/logos/logo white.png';

const screenHeight = Dimensions.get('window').height;

export default function Index() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    itim: Itim_400Regular,
  });

  // ✅ Navigate automatically to /home after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home'); // replace instead of push (no back button)
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.img} />
      <Text style={styles.title1}>WiseBuy</Text>
      <Text style={styles.title2}>Shop smart. Stock right.</Text>
      <Text style={styles.title3}>Save big.</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#197FF4',
  },
  img: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginTop: screenHeight * 0.1,
  },
  title1: {
    fontFamily: 'itim',
    fontWeight: 'bold',
    fontSize: 40,
    color: '#FFFFFF',
    marginTop: -20,
  },
  title2: {
    fontFamily: 'itim',
    fontWeight: 'bold',
    fontSize: 30,
    color: '#FFFFFF',
    marginTop: 8,
  },
  title3: {
    fontFamily: 'itim',
    fontWeight: 'bold',
    fontSize: 30,
    color: '#FFFFFF',
  },
});
