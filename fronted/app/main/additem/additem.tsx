import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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
      name: "meats",
      key: "meats",
      image: { uri: `${API_URL}/uploads/products/meat.png` },
    },
    {
      name: "dairy",
      key: "dairy",
      image: { uri: `${API_URL}/uploads/products/dairy.png` },
    },
    {
      name: "drinks",
      key: "drinks",
      image: { uri: `${API_URL}/uploads/products/drinks.png` },
    },
    {
      name: "snacks",
      key: "snacks",
      image: { uri: `${API_URL}/uploads/products/snacks.png` },
    },
    {
      name: "sauces",
      key: "sauces",
      image: { uri: `${API_URL}/uploads/products/sauces.png` },
    },
    {
      name:  "cosmetics",
      key: "cosmetics",
      image: { uri: `${API_URL}/uploads/products/cosmetics.png` },
    },
    {
      name: "hygiene",
      key: "hygiene",
      image: { uri: `${API_URL}/uploads/products/hygiene.png` },
    },
    {
      name: "cereals",
      key: "cereals",
      image: { uri: `${API_URL}/uploads/products/cereals.png` },
    },
    {
      name: "frozen",
      key: "frozen",
      image: { uri: `${API_URL}/uploads/products/frozen.png` },
    },
     {
      name: "fruits",
      key: "fruits",
      image: { uri: `${API_URL}/uploads/products/fruit.png` },
    },
    {
      name: "other",
      key: "other",
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

      <View style={styles.categoriesGrid}>
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
      </View>
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
    marginTop: 8,
    paddingBottom: 60,
  },
});
