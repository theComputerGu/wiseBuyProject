import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';



/**
 * ✅ WiseBuy Bottom Navigation Component
 * Use: <BottomNav active="home" />
 */
export default function BottomNav() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => handleNavigate('/product')}>
        <MaterialCommunityIcons
          name="home"
          size={28}
                  color={'#197FF4'}

        />
      </Pressable>

      <Pressable onPress={() => handleNavigate('/group')}>
        <MaterialCommunityIcons
          name="account-group"
          size={28}
          color={'#197FF4'}

        />
      </Pressable>

      <Pressable
        style={styles.addButton}
        onPress={() => handleNavigate('/additem')}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </Pressable>

      <Pressable onPress={() => handleNavigate('/history')}>
        <MaterialCommunityIcons
          name="clipboard-text-outline"
          size={28}
          color={'#197FF4'}
        />
      </Pressable>

      <Pressable onPress={() => handleNavigate('/checkout')}>
        <MaterialCommunityIcons
          name="cart"
          size={28}
          color={'#197FF4'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderColor: '#ffffffff',
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#197FF4',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
