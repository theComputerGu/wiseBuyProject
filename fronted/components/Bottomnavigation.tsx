import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

/**
 * ✅ WiseBuy Bottom Navigation Component
 * Highlights the current page and disables re-navigation to it
 */
export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname(); // 🧭 Current route path

  // navigation helper — prevents reloading same route
  const handleNavigate = (path: string) => {
    if (pathname !== path) {
      router.replace(path);
    }
  };

  // function for coloring active icon
  const getIconColor = (path: string) =>
    pathname === path ? '#197FF4' : '#999';

  return (
    <View style={styles.container}>
      {/* 🏠 Home */}
      <Pressable onPress={() => handleNavigate('/main/product')}>
        <MaterialCommunityIcons
          name="home"
          size={28}
          color={getIconColor('/main/product')}
        />
      </Pressable>

      {/* 👥 Groups */}
      <Pressable onPress={() => handleNavigate('/main/group')}>
        <MaterialCommunityIcons
          name="account-group"
          size={28}
          color={getIconColor('/main/group')}
        />
      </Pressable>

      {/* ➕ Add Item */}
      <Pressable
        style={[
          styles.addButton,
          pathname === '/main/additem/additem' && styles.addButtonActive,
        ]}
        onPress={() => handleNavigate('/main/additem/additem')}
      >
        <MaterialCommunityIcons
          name="plus"
          size={30}
          color={pathname === '/main/additem/additem' ? '#fff' : '#fff'}
        />
      </Pressable>

      {/* 📋 History */}
      <Pressable onPress={() => handleNavigate('/main/history/history')}>
        <MaterialCommunityIcons
          name="clipboard-text-outline"
          size={28}
          color={getIconColor('/main/history/history')}
        />
      </Pressable>

      {/* 🛒 Checkout */}
      <Pressable onPress={() => handleNavigate('/main/checkout/checkout')}>
        <MaterialCommunityIcons
          name="cart"
          size={28}
          color={getIconColor('/main/checkout/checkout')}
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
    marginTop: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 0.3,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#197FF4',
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonActive: {
    backgroundColor: '#005FCC', // darker when active
  },
});
