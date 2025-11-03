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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ItimText from '../components/Itimtext';

const screenWidth = Dimensions.get('window').width;

const mostOrdered = [
  { id: '1', name: 'חזה עוף טרי', price: '52.40₪', weight: '648₪/kg', image: require('../assets/logo black.png') },
  { id: '2', name: 'חזה עוף טרי', price: '52.40₪', weight: '648₪/kg', image: require('../assets/logo black.png') },
  { id: '3', name: 'חזה עוף טרי', price: '52.40₪', weight: '648₪/kg', image: require('../assets/logo black.png') },
];

const categories = Array(12)
  .fill(null)
  .map((_, i) => ({
    id: i.toString(),
    name: 'בשרים',
    image: require('../assets/logo black.png'),
  }));

export default function AddItemScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ✅ Back Button + Search Bar in same row */}
      <View style={styles.topRow}>
        <Pressable onPress={() => router.push('/product')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
        </Pressable>

        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#197FF4" />
          <TextInput
            placeholder="looking for a specific item"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* ✅ Scroll Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ✅ Most Ordered Section */}
        <ItimText size={18} color="#197FF4" style={styles.sectionTitle}>
          most ordered
        </ItimText>

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
        <ItimText size={18} color="#197FF4" style={styles.sectionTitle}>
          Categories
        </ItimText>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 75,
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  sectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    marginLeft: 6,
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
  },
});
