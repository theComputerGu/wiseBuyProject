import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import FontText from '../components/Itimtext'; // ✅ correct import name
import Logo from '../assets/logos/logo white.png';

const screenHeight = Dimensions.get('window').height;

export default function Index() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ itim: Itim_400Regular });

  // נציג את האנימציה עד הניווט
  const [showAnim, setShowAnim] = useState(true);

  // אנימציית "נשימה" ללוגו
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scaleAnim]);

  // ניווט אחרי 3 שניות
  useEffect(() => {
    const t = setTimeout(() => {
      setShowAnim(false);
      router.replace('/home');
    }, 3000);
    return () => clearTimeout(t);
  }, [router]);

  // אם הפונטים עדיין לא נטענו, אפשר להחזיר מסך ריק קצר או את אותה תצוגה (לבחירתך)
  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
  <View style={styles.container}>
    <Animated.Image
      source={Logo}
      style={[styles.img, { transform: [{ scale: scaleAnim }] }]}
    />
    <Text style={styles.title1}>WiseBuy</Text>
    <Text style={styles.title2}>Shop smart. Stock right.</Text>

    {/* הזזנו את Save big לפני האנימציה */}
    <Text style={styles.title3}>Save big.</Text>

    {/* האנימציה מתחת לטקסט */}
    {showAnim && (
      <LottieView
        source={require('../assets/animations/loading.json')}
        autoPlay
        loop
        style={{ width: 180, height: 180, marginTop: 6 }}
      />
    )}
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#197FF4' },
  img: { width: 300, height: 300, resizeMode: 'contain', marginTop: screenHeight * 0.1 },
  title1: { fontFamily: 'itim', fontWeight: 'bold', fontSize: 40, color: '#FFFFFF', marginTop: -20 },
  title2: { fontFamily: 'itim', fontWeight: 'bold', fontSize: 30, color: '#FFFFFF', marginTop: 8 },
  title3: { fontFamily: 'itim', fontWeight: 'bold', fontSize: 30, color: '#FFFFFF' },
});
