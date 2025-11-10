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
import Title from '../../components/Title';
import ItimText from '../../components/Itimtext';
import Logo from '../../assets/logos/logo blue.png';
import { API_URL } from '@env';

const screenHeight = Dimensions.get('window').height;

export default function Home() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ itim: Itim_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#197FF4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Image source={Logo} style={styles.img} />

        {/* ✅ Use Title component for consistency */}
        <ItimText size={70} color="#197FF4"  family='Itim_400Regular'>
          WiseBuy
        </ItimText>
        <ItimText size={30} color="#197FF4" style={{ marginTop: 6 }} family='Itim_400Regular'>
          Shop smart. Stock right.
        </ItimText>
        <ItimText size={30} color="#197FF4" family='Itim_400Regular'>
          Save big.
        </ItimText>

        {/* ✅ Buttons Side by Side */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.signInButton}
            onPress={() => router.replace('/auth/sign-in')}
          >
            <ItimText size={20} color="#197FF4" weight="bold">
              Sign In
            </ItimText>
          </Pressable>

          <Pressable
            style={styles.signUpButton}
            onPress={() => router.replace('/auth/sign-up')}
          >
            <ItimText size={20} color="#197FF4" weight="bold">
              Register
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
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  img: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    marginBottom: 10,
    marginRight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    marginTop: 60,
  },
  signInButton: {
     flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#197FF4',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 3,
  },
  signUpButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#197FF4',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 3,
  },
});
