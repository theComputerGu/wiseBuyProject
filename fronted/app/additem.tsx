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
import ItimText from '../components/Itimtext';
import Title from '../components/Title';
import SearchHeader from '../components/SearchHeader';

const screenWidth = Dimensions.get('window').width;

// ✅ Dummy Data
const mostOrdered = [
  {
    id: '1',
    name: 'חזה עוף טרי',
    price: '52.40₪',
    weight: '648₪/kg',
    image: require('../assets/products/Chicken-breast.png'),
  },
  {
    id: '2',
    name: 'חזה עוף טרי',
    price: '52.40₪',
    weight: '648₪/kg',
    image: require('../assets/products/Chicken-breast.png'),
  },
  {
    id: '3',
    name: 'חזה עוף טרי',
    price: '52.40₪',
    weight: '648₪/kg',
    image: require('../assets/products/Chicken-breast.png'),
  },
];

const categories = Array(12)
  .fill(null)
  .map((_, i) => ({
    id: i.toString(),
    name: 'בשרים',
    image: require('../assets/products/ground-beef.png'),
  }));

export default function AddItemScreen() {
  const router = useRouter();

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={styles.container}>
        {/* ✅ Back Button + Search Bar */}
        <SearchHeader
          placeholder="Search items..."
          backRoute="/product"
          onSearchChange={(text) => console.log('Searching:', text)}
        />

        {/* ✅ Scrollable Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ✅ Most Ordered */}
          <Title text="Most ordered" />

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={mostOrdered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => (
              <View style={styles.mostCard}>
                <Image source={item.image} style={styles.mostImage} />
                <ItimText size={14} color="#197FF4" weight="bold">
                  {item.price}
                </ItimText>
                <ItimText size={14} color="#000">
                  {item.name}
                </ItimText>
                <ItimText size={12} color="#555">
                  {item.weight}
                </ItimText>
              </View>
            )}
          />

          {/* ✅ Categories */}
          <Title text="Categories" />

          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <View key={cat.id} style={styles.categoryCard}>
                <Image source={cat.image} style={styles.categoryImage} />
                <ItimText size={16} color="#000">
                  {cat.name}
                </ItimText>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  mostCard: {
    width: screenWidth * 0.34,
    backgroundColor: '#ffffffff',
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
    backgroundColor: 'transparent', // ✅ allow transparent PNGs
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingBottom: 60,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
    marginBottom: 4,
    backgroundColor: 'transparent', // ✅ transparent background
  },
});
