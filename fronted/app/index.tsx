import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import LottieView from 'lottie-react-native';
import ItimText from '../components/Itimtext';

// צבע ראשי של WiseBuy
const BRAND_BLUE = '#197FF4';

// לוגו
import Logo from '../assets/logos/logo blue.png';

export default function Index() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Itim_400Regular });

  // אנימציית נשימה ללוגו
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showAnim, setShowAnim] = useState(true);

  // 🔁 Breathing animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [scaleAnim]);

  // ⏱ מעבר מסך
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnim(false);
      router.replace('/auth/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.container}>
        {/* לוגו עם נשימה */}
        <Animated.Image
          source={Logo}
          style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
        />

        {/* טקסטים */}
        <ItimText size={40} weight="bold" color={BRAND_BLUE}>
          WiseBuy
        </ItimText>

        <ItimText
          size={24}
          weight="bold"
          color={BRAND_BLUE}
          style={{ marginTop: 6 }}
        >
          Shop smart. Stock right.
        </ItimText>

        <ItimText size={24} weight="bold" color={BRAND_BLUE}>
          Save big.
        </ItimText>

        {/* Loading animation */}
        {showAnim && (
          <LottieView
            source={require('../assets/animations/loading.json')}
            autoPlay
            loop
            style={styles.lottie}
            colorFilters={[
              {
                keypath: '**',
                color: BRAND_BLUE,
              },
            ]}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 260,
    height: 260,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  lottie: {
    width: 140,
    height: 140,
    marginTop: 10,
  },
});
