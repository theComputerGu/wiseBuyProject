import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import ItimText from '../components/Itimtext'; 
import Logo from '../assets/logos/logo black.png';

const screenHeight = Dimensions.get('window').height;

export default function Home() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Itim_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.img} />
      <ItimText size={40} weight="bold" color="#000">WiseBuy</ItimText>
      <ItimText size={24} color="#000">Shop smart. Stock right.</ItimText>
      <ItimText size={24} color="#000" style={{ marginBottom: 40 }}>
        Save big.
      </ItimText>

      {/* ✅ Buttons Side by Side */}
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.signInButton}
          onPress={() => router.push('/sign-in')}
        >
          <ItimText size={20} color="#fff" weight="bold">Sign In</ItimText>
        </Pressable>

        <Pressable
          style={styles.signUpButton}
          onPress={() => router.push('/sign-up')}
        >
          <ItimText size={20} color="#197FF4" weight="bold">Sign Up</ItimText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  center: {
    justifyContent: 'center',
  },
  img: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: screenHeight * 0.03,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    gap: 15,
    marginTop: 40,
  },
  signInButton: {
    flex: 1,
    backgroundColor: '#197FF4',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  signUpButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#197FF4',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
});
