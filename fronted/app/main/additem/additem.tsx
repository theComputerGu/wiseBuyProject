import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Title from '../../../components/Title';
import ItimText from '../../../components/Itimtext';
import { API_URL } from '@env';

const BRAND = '#197FF4';

export default function AddItemScreen() {
  const router = useRouter();

  const categories = [
    { name: "ירקות ופירות", key: "ירקות ופירות", image: { uri: `${API_URL}/uploads/products/fruit.png` } },
    { name: "מוצרי קירור וביצים", key: "מוצרי קירור וביצים", image: { uri: `${API_URL}/uploads/products/dairy.png` } },
    { name: "לחמים ומאפים", key: "לחמים ומאפים", image: { uri: `${API_URL}/uploads/products/bread.png` } },
    { name: "עוף בשר ודגים", key: "עוף בשר ודגים", image: { uri: `${API_URL}/uploads/products/meat.png` } },
    { name: "שימורים", key: "שימורים", image: { uri: `${API_URL}/uploads/products/shimurim.png` } },
    { name: "מעדנייה וסלטים", key: "מעדנייה וסלטים", image: { uri: `${API_URL}/uploads/products/salads.png` } },
    { name: "משקאות ויין", key: "משקאות ויין", image: { uri: `${API_URL}/uploads/products/drinks.png` } },
    { name: "חטיפים וממתקים", key: "חטיפים וממתקים", image: { uri: `${API_URL}/uploads/products/snacks.png` } },
    { name: "פארם ותינוקות", key: "פארם ותינוקות", image: { uri: `${API_URL}/uploads/products/cosmetics.png` } },
    { name: "הכל לבית", key: "הכל לבית", image: { uri: `${API_URL}/uploads/products/hygiene.png` } },
    { name: "אחר", key: "אחר", image: { uri: `${API_URL}/uploads/products/other.png` } },
  ];

  const navigateToCategory = (key: string) => {
    router.replace(`/main/additem/additemcategory?name=${key}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => router.replace('/main/product')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={BRAND} />
          </Pressable>
          <View style={styles.titleContainer}>
            <Title text="Add Item" color={BRAND} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="shape" size={20} color={BRAND} />
          <ItimText size={16} weight="600" color="#1a1a1a" style={{ marginLeft: 8 }}>
            Select Category
          </ItimText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {categories.map((cat) => (
            <Pressable
              key={cat.key}
              style={styles.categoryRow}
              onPress={() => navigateToCategory(cat.key)}
            >
              <View style={styles.imageContainer}>
                <Image source={cat.image} style={styles.categoryImage} />
              </View>
              <ItimText size={18} color="#1a1a1a" weight="600" style={styles.categoryName}>
                {cat.name}
              </ItimText>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#d4d4d8" />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryImage: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
  },
  categoryName: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});