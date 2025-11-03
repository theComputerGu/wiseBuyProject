import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';
import Logo from '../assets/logos/logo black.png';

const screenHeight = Dimensions.get('window').height;

export default function Home() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    itim: Itim_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.img} />
      <Text style={styles.title1}>WiseBuy</Text>
      <Text style={styles.title2}>Shop smart. Stock right.</Text>
      <Text style={styles.title3}>Save big.</Text>

      {/* ✅ Buttons Side by Side */}
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.signInButton}
          onPress={() => router.push('/signin')}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </Pressable>

        <Pressable
          style={styles.signUpButton}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    marginTop: -20,
  },
  title2: {
    fontFamily: 'itim',
    fontWeight: 'bold',
    fontSize: 30,
    color: '#000000',
    marginTop: 8,
  },
  title3: {
    fontFamily: 'itim',
    fontWeight: 'bold',
    fontSize: 30,
    color: '#000000',
    marginBottom: 40,
  },

  /* ✅ New layout for horizontal buttons */
  buttonRow: {
    flexDirection: 'row', // side by side
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    gap: 15, // adds space between them (RN 0.71+)
    marginTop: 80
  },

  signInButton: {
    flex: 1,
    backgroundColor: '#197FF4',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  signInText: {
    color: '#FFFFFF',
    fontFamily: 'itim',
    fontSize: 20,
    fontWeight: 'bold',
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
  signUpText: {
    color: '#197FF4',
    fontFamily: 'itim',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
