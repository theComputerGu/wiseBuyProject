import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import ItimText from './Itimtext';

export default function TopNav() {
  const router = useRouter();
  const user = useSelector((s: any) => s.auth?.user); // נשלף את המשתמש מה-Redux

  const avatarUrl = user?.avatarUrl;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.push('/account')}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <MaterialCommunityIcons
              name="account-circle"
              size={50}
              color="#197FF4"
              style={styles.icon}
            />
          )}
        </Pressable>

        <ItimText size={40} weight="bold" color="#197FF4" family='Itim_400Regular'>
          WiseBuy
        </ItimText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 6,
    borderWidth: 2,
    borderColor: '#197FF4',
  },
});
