import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import LottieView from 'lottie-react-native';
import ItimText from '../components/Itimtext'; 
import Logo from '../assets/logos/logo white.png';

const screenHeight = Dimensions.get('window').height;

export default function Index() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Itim_400Regular });

  // Animation control
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showAnim, setShowAnim] = useState(true);

  // ✅ Breathing logo animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [scaleAnim]);

  // ✅ Navigate after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnim(false);
      router.replace('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* ✅ Animated Logo */}
      <Animated.Image
        source={Logo}
        style={[styles.img, { transform: [{ scale: scaleAnim }] }]}
      />

      {/* ✅ Texts using Itim font */}
      <ItimText size={40} weight="bold" color="#fff" style={{ marginTop: -20 }}>
        WiseBuy
      </ItimText>
      <ItimText size={28} color="#fff" weight="bold" style={{ marginTop: 8 }}>
        Shop smart. Stock right.
      </ItimText>
      <ItimText size={28} color="#fff" weight="bold">
        Save big.
      </ItimText>

      {/* ✅ Loading animation (Lottie) */}
      {showAnim && (
        <LottieView
          source={require('../assets/animations/loading.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#197FF4',
  },
  img: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  lottie: {
    width: 150,
    height: 150,
    marginTop: 6,
  },
});
