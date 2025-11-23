import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
        <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
      </Pressable>

      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={22} color="#197FF4" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#888"
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
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  backButton: {
    backgroundColor: '#197FF4',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#197FF4',
    borderWidth: 1.5,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f8f8',
    flex: 1,
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 16,
    color: '#000',
  },
});
