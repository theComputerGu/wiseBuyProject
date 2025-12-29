import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BRAND = '#197FF4';

interface SearchHeaderProps {
  placeholder?: string;
  backRoute?: string;
  onSearchChange?: (text: string) => void;
  value?: string;
}

export default function SearchHeader({
  placeholder = 'Looking for a specific item',
  backRoute = '/main/product',
  onSearchChange,
  value,
}: SearchHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.topRow}>
      <Pressable onPress={() => router.replace(backRoute)} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={BRAND} />
      </Pressable>

      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color={BRAND} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          onChangeText={onSearchChange}
          value={value}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1a1a1a',
  },
});
