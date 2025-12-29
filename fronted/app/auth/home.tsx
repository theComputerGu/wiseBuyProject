import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../../components/Itimtext';
import Logo from '../../assets/logos/logo blue.png';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BRAND = '#197FF4';

export default function Home() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ itim: Itim_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative background elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      <View style={styles.inner}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} />
          </View>

          <ItimText size={48} color={BRAND} weight="bold" style={styles.appName}>
            WiseBuy
          </ItimText>
        </View>

        {/* Tagline Section */}
        <View style={styles.taglineSection}>
          <ItimText size={22} color="#1a1a1a" weight="600" style={styles.taglineMain}>
            Shop smart. Stock right.
          </ItimText>
          <ItimText size={22} color={BRAND} weight="bold" style={styles.taglineAccent}>
            Save big.
          </ItimText>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="tag-outline" size={20} color={BRAND} />
            </View>
            <ItimText size={12} color="#71717a">Best Prices</ItimText>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={BRAND} />
            </View>
            <ItimText size={12} color="#71717a">Nearby Stores</ItimText>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="cart-outline" size={20} color={BRAND} />
            </View>
            <ItimText size={12} color="#71717a">Smart Lists</ItimText>
          </View>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonSection}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace('/auth/sign-up')}
          >
            <ItimText size={18} color="#fff" weight="bold">
              Get Started
            </ItimText>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace('/auth/sign-in')}
          >
            <ItimText size={16} color={BRAND} weight="600">
              Already have an account? Sign In
            </ItimText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // Decorative circles
  decorCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(25, 127, 244, 0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    top: screenHeight * 0.3,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(25, 127, 244, 0.05)',
  },
  decorCircle3: {
    position: 'absolute',
    bottom: 100,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(25, 127, 244, 0.06)',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  appName: {
    letterSpacing: 1,
  },
  // Tagline Section
  taglineSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  taglineMain: {
    textAlign: 'center',
  },
  taglineAccent: {
    textAlign: 'center',
    marginTop: 4,
  },
  // Features Row
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 50,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  // Button Section
  buttonSection: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: BRAND,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
