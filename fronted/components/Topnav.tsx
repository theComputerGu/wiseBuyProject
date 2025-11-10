import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ItimText from './Itimtext';


export default function Topnav() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ✅ Icon + Text in one row */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.replace('/main/account')}>
          <MaterialCommunityIcons
            name="account-circle"
            size={50}
            color="#197FF4"
            style={styles.icon}
          />
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
    marginRight: 6, // ✅ small space between icon and text
  },
  subtitle: {
    marginLeft: 36, // ✅ slight indent so it aligns under text
  },
});
