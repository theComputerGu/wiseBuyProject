import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import ItimText from '../components/Itimtext';

export default function Index() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Itim_400Regular });

  // 🎞️ Fade animation for smooth appearance
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in effect
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* 🎬 Fullscreen background video */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <Video
          source={require('../assets/logos/cart-gif.mp4')}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
        />
      </Animated.View>

      {/* 📝 Optional overlay text (currently commented) */}
      {/*
      <ItimText size={40} weight="bold" color="#fff" style={{ marginTop: -10 }}>
        WiseBuy
      </ItimText>
      <ItimText size={28} color="#fff" weight="bold" style={{ marginTop: 8 }}>
        Shop smart. Stock right.
      </ItimText>
      <ItimText size={28} color="#fff" weight="bold">
        Save big.
      </ItimText>
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // fallback while video loads
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '60%',
  },
});
