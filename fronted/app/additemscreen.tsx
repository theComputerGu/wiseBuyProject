import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../components/ItimText';

const screenWidth = Dimensions.get('window').width;

// ✅ Dummy data
const mostOrdered = [
  {
    id: '1',
    name: 'חזה עוף טרי',
    price: '52.40₪',
    weight: '648₪/kg',
    image: require('../assets/logo black.png'),
  },
  {
    id: '2',
    name: 'חזה עוף טרי',
    price: '52.40₪',
    weight: '648₪/kg',
    image: require('../assets/logo black.png'),
  },
  {
    id: '3',
    name: 'חזה עוף טרי',
    price: '52.40₪',
    weight: '648₪/kg',
    image: require('../assets/logo black.png'),
  },
];

const categories = Array(12).fill({
  id: Math.random().toString(),
  name: 'בשרים',
image: require('../assets/logo black.png'),
});

export default function AddItemScreen() {
  return (
    <View style={styles.container}>
      {/* ✅ Search Bar */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={22} color="#197FF4" />
        <TextInput
          placeholder="looking for a specific item"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ✅ Most Ordered Section */}
        <ItimText size={18} color="#000" style={styles.sectionTitle}>
          most ordered
        </ItimText>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={mostOrdered}
          keyExtractor={(item) => item.id}
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
        <ItimText size={18} color="#000" style={styles.sectionTitle}>
          Categories
        </ItimText>

        <View style={styles.categoriesGrid}>
          {categories.map((cat, index) => (
            <View key={index} style={styles.categoryCard}>
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
    paddingTop: 50,
    paddingHorizontal: 10,
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
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  mostCard: {
    width: screenWidth * 0.35,
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
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingBottom: 80,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 4,
  },
});
