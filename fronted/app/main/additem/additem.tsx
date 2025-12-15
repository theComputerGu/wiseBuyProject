import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Title from '../../../components/Title';
import SearchHeader from '../../../components/SearchHeader';
import CategoryCard from '../../../components/categorycard';
import { API_URL } from '@env';

export default function AddItemScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const categories = [
    {
      name: "ירקות ופירות",
      key: "ירקות ופירות",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "מוצרי קירור וביצים",
      key: "מוצרי קירור וביצים",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "לחמים עוגות ועוגיות",
      key: "לחמים עוגות ועוגיות",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "עוף בשר ודגים",
      key: "עוף בשר ודגים",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "שימורים בישול ואפייה",
      key: "שימורים בישול ואפייה",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "דגנים",
      key: "דגנים",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "מעדנייה סלטים ונקניקים",
      key: "מעדנייה סלטים ונקניקים",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "קפואים",
      key: "קפואים",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "משקאות ויין",
      key: "משקאות ויין",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "בריאות ותזונה",
      key: "בריאות ותזונה",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "חטיפים וממתקים",
      key: "חטיפים וממתקים",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "נקיון",
      key: "נקיון",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "פארם ותינוקות",
      key: "פארם ותינוקות",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "פנאי ובעלי חיים",
      key: "פנאי ובעלי חיים",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "הכל לבית",
      key: "הכל לבית",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
    {
      name: "אחר",
      key: "אחר",
      image: { uri: `${API_URL}/uploads/products/other.png` },
    },
  ];

  // ✅ חיפוש בקטגוריות
  const filteredCategories = categories.filter(cat =>
    cat.name.includes(search) ||
    cat.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <SearchHeader
        placeholder="Search category..."
        backRoute="/main/product"
        value={search}
        onSearchChange={setSearch}
      />

      <Title text="Categories" />

      {/* ✅ SCROLL VIEW */}
      <ScrollView
        contentContainerStyle={styles.categoriesGrid}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.map((cat) => (
          <CategoryCard
            key={cat.key}
            name={cat.name}
            image={cat.image}
            onPress={() =>
              router.replace(
                `/main/additem/additemcategory?name=${cat.key}`
              )
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },

  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
    paddingBottom: 60,
    marginTop: 8,
  },
});