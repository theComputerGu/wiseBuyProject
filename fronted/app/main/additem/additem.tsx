import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ItimText from '../../../components/Itimtext';
import Title from '../../../components/Title';
import SearchHeader from '../../../components/SearchHeader';
import CategoryCard from '../../../components/categorycard';
import { useGetProductsQuery } from '../../../redux/svc/productApi';
import { useSelector } from 'react-redux';

const screenWidth = Dimensions.get('window').width;

export default function AddItemScreen() {
  const router = useRouter();
  const ShoppingList = useSelector((s: any) => s?.shoppingList);

  // 🚀 Fetch all products dynamically
  const { data: products = [], isLoading } = useGetProductsQuery({});

  // 🥇 "Most ordered" for now = first 10 items from backend
  const mostOrdered = products.slice(0, 10);

  // 🗂 Extract unique categories
  const categories = Array.from(
    new Map(
      products
        .filter((p) => p.category) // only valid categories
        .map((p) => [p.category, p.category]) // remove duplicates
    ).values()
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔍 Back Button + Search Bar */}
      <SearchHeader
        placeholder="Search items..."
        backRoute="/main/product"
        onSearchChange={(text) => console.log('Searching:', text)}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🍗 Most Ordered */}
        <Title text="Most ordered" />

        {isLoading ? (

          <ItimText size={16}>Loading...</ItimText>
        ) : (

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={mostOrdered}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.mostList}
            renderItem={({ item }) => (
              <View style={styles.mostCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.mostImage}
                />
                <ItimText size={14} color="#197FF4" weight="bold">
                  {item.pricerange ?? "N/A"}
                </ItimText>
                <ItimText size={14} color="#000">
                  {item.title}
                </ItimText>
                <ItimText size={12} color="#555">
                  {item.unit ?? ""}
                </ItimText>
              </View>
            )}
          />
        )}

        {/* 📂 Categories */}
        <Title text="Categories" />

        <View style={styles.categoriesGrid}>
          {categories.map((catName, i) => (
            <CategoryCard
              key={i}
              name={catName ?? "Uncategorized"}
              image={require('../../../assets/products/ground-beef.png')} // TODO: dynamic images later
              onPress={() =>
                router.replace(
                  `/main/additem/additemcategory?name=${catName}`
                )
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  mostList: {
    paddingVertical: 8,
  },
  mostCard: {
    width: screenWidth * 0.34,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mostImage: {
    width: 85,
    height: 85,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingBottom: 60,
  },
});
