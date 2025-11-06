import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../components/Itimtext';
import Logo from '../assets/logos/logo black.png';
import BottomNav from '../components/Bottomnavigation';
import TopNav from '../components/Topnav'
import Title from '../components/Title'
import BottomSummary from '../components/BottomSummary';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function product() {
  return (
    <SafeAreaView style={styles.container}>
      <TopNav />
      <Title text="Sean and mark home" />


      {/* ✅ Product list */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ProductCard
          name="חלב תנובה 1% ליטר"
          price="6.94₪"
          average="מחיר ממוצע"
          image={require('../assets/products/חלב תנובה.png')}
          quantity={1}
        />
        <ProductCard
          name="חלב טרה 3% ליטר"
          price="14.86₪"
          average="מחיר ממוצע"
          image={require('../assets/products/חלב טרה.png')}
          quantity={2}
        />
      </ScrollView>
      <Title text=" Recommendation's" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ProductCard
          name="חלב יטבתה 3% ליטר"
          price="5.94₪"
          average="מחיר ממוצע"
          image={require('../assets/products/חלב יטבתה.jpeg')}
          quantity={0}
        />
      </ScrollView>

      <BottomSummary amount={2} price={21.8} />
      <BottomNav />
    </SafeAreaView>
  );
}

/* ✅ Product Card Component */
interface ProductCardProps {
  name: string;
  price: string;
  average: string;
  image: any;
  quantity: number;
}

function ProductCard({ name, price, average, image, quantity }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.cardImg} />
      <View style={styles.cardInfo}>
        <ItimText size={16} color="#000" weight="bold">{name}</ItimText>
        <ItimText size={14} color="#555">
          {price} ({average})
        </ItimText>
        <View style={styles.cardActions}>
          <MaterialCommunityIcons name="account-circle" size={22} color="#197FF4" />
          <View style={styles.quantityBox}>
            <ItimText size={16} color="#197FF4" weight="bold">
              {quantity}
            </ItimText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, justifyContent: "flex-start" },
  scrollContent: { paddingBottom: 0 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  cardImg: {
    width: 60,
    height: 90,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  quantityBox: {
    borderWidth: 1,
    borderColor: '#197FF4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

});
