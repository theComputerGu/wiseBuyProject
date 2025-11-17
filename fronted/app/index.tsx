import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import ItimText from '../components/Itimtext';

export default function Index() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Itim_400Regular });

  // 🎞️ Fade animation for smooth appearance
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🎥 Setup the video player
  const player = useVideoPlayer(require('../assets/logos/cart-gif.mp4'), (status) => {
    // You can handle playback status here if needed
  });

  useEffect(() => {
    // Auto-play and loop
    player.play();
    player.loop = true;

    // Fade-in effect
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/auth/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* 🎬 Fullscreen background video */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit='cover'
        />
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
