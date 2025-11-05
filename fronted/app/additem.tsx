import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ItimText from '../components/Itimtext';
import Title from '../components/Title'
import SearchHeader from '../components/SearchHeader';

const screenWidth = Dimensions.get('window').width;

const mostOrdered = [
  { id: '1', name: 'חזה עוף טרי', price: '52.40₪', weight: '648₪/kg', image: require('../assets/products/chicken-breast.png') },
  { id: '2', name: 'חזה עוף טרי', price: '52.40₪', weight: '648₪/kg', image: require('../assets/products/chicken-breast.png') },
  { id: '3', name: 'חזה עוף טרי', price: '52.40₪', weight: '648₪/kg', image: require('../assets/products/chicken-breast.png') },
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <View style={styles.container}>
      <SearchHeader
        placeholder="Search items..."
        backRoute="/product"
        onSearchChange={(text) => console.log('Searching:', text)}
      />

      {/* ✅ Scroll Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ✅ Most Ordered Section */}
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

        {/* ✅ Categories Section */}
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

const styles = StyleSheet.create({
  container: { 
  flex: 1, 
  backgroundColor: '#fff', 
  paddingTop: 10, 
  paddingHorizontal: 20, 
  marginBottom: 1 
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
  mostCard: {
    width: screenWidth * 0.34,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
    marginBottom: 4,
    backgroundColor: '#fff'
  },
});
