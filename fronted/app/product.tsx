import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../components/itimtext';
import Logo from '../assets/logos/logo black.png';

export default function product() {
  return (
    <View style={styles.container}>
      {/* ✅ Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="account-circle" size={28} color="#197FF4" />
          <ItimText size={22} color="#197FF4" weight="bold" style={{ marginLeft: 6 }}>
            WiseBuy
          </ItimText>
        </View>
        <MaterialCommunityIcons name="menu" size={28} color="#197FF4" />
      </View>

      {/* ✅ Home title */}
      <ItimText size={20} color="#197FF4" weight="bold" style={{ marginLeft: 20 }}>
        Sean & Mark home
      </ItimText>

      {/* ✅ Product list */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProductCard
          name="חלב תנובה 1% ליטר"
          price="6.94₪"
          average="מחיר ממוצע"
          image={require('../assets/logo black.png')}
          quantity={1}
        />
        <ProductCard
          name="חלב טרה 3% ליטר"
          price="14.86₪"
          average="מחיר ממוצע"
          image={require('../assets/logo black.png')}
          quantity={2}
        />

        {/* ✅ Recommendations section */}
        <ItimText size={20} color="#197FF4" weight="bold" style={{ marginTop: 20 }}>
          Recommendation's
        </ItimText>

        <ProductCard
          name="חלב יטבתה 3% ליטר"
          price="5.94₪"
          average="מחיר ממוצע"
          image={require('../assets/logo black.png')}
          quantity={0}
        />
      </ScrollView>

      {/* ✅ Bottom summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <ItimText size={18} color="#000">Amount</ItimText>
          <ItimText size={18} color="#000" weight="bold">3</ItimText>
        </View>
        <View style={styles.summaryItem}>
          <ItimText size={18} color="#000">Price (Estimated)</ItimText>
          <ItimText size={18} color="#000" weight="bold">21.8₪</ItimText>
        </View>
      </View>

      {/* ✅ Bottom navigation */}
      <View style={styles.bottomNav}>
        <MaterialCommunityIcons name="home" size={28} color="#197FF4" />
        <MaterialCommunityIcons name="account-group" size={28} color="#197FF4" />
        <Pressable style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={32} color="#fff" />
        </Pressable>
        <MaterialCommunityIcons name="cart" size={28} color="#197FF4" />
        <MaterialCommunityIcons name="account" size={28} color="#197FF4" />
      </View>
    </View>
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
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 10,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 100 },
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  summaryItem: { alignItems: 'center' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#197FF4',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
