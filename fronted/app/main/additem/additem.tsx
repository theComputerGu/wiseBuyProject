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

const API_URL = "http://192.168.199.122:3000"; // ✅ URL רגיל

export default function AddItemScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const categories = [
    {
      name: "בשר",
      key: "meats",
      image: { uri: `${API_URL}/uploads/products/MEAT.png` },
    },
    {
      name: "חלב ומוצרי חלב",
      key: "milk",
      image: { uri: `${API_URL}/uploads/products/MILK.png` },
    },
    {
      name: "ירקות",
      key: "vegetables",
      image: { uri: `${API_URL}/uploads/products/VEGTABLE.png` },
    },
    {
      name: "פירות",
      key: "fruits",
      image: { uri: `${API_URL}/uploads/products/FRUIT.png` },
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
    justifyContent: 'space-between',
    marginTop: 8,
    paddingBottom: 60,
  },
});
