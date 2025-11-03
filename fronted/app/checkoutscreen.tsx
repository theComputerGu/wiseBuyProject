import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../components/Itimtext';

export default function CheckoutScreen() {
  const stores = [
    {
      id: 1,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
    {
      id: 2,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
    {
      id: 3,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
    {
      id: 4,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
    {
      id: 5,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ✅ Header */}
        <ItimText size={28} weight="bold" color="#197FF4" style={styles.logo}>
          WiseBuy
        </ItimText>

        {/* ✅ Section Title */}
        <ItimText size={22} weight="bold" color="#197FF4" style={styles.section}>
          Check Out
        </ItimText>

        {/* ✅ Location */}
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#197FF4" />
          <ItimText size={16} color="#197FF4" style={{ marginLeft: 5 }}>
            Your current location
          </ItimText>
          <MaterialCommunityIcons
            name="heart"
            size={18}
            color="#197FF4"
            style={{ marginLeft: 4 }}
          />
        </View>

        <ItimText size={16} color="#197FF4" style={{ marginBottom: 10 }}>
          Top 5 stores near your location
        </ItimText>

        {/* ✅ Stores List */}
        {stores.map((store) => (
          <View key={store.id} style={styles.storeCard}>
            <View style={styles.priceInfo}>
              <ItimText size={15} color="#197FF4" weight="bold">
                {store.price}
              </ItimText>
              <ItimText size={13} color="#000">
                מחיר סל
              </ItimText>
            </View>

            <View style={styles.storeInfo}>
              <ItimText size={16} color="#000" weight="bold">
                {store.name}
              </ItimText>
              <View style={styles.addressRow}>
                <MaterialCommunityIcons
                  name="earth"
                  size={16}
                  color="#197FF4"
                />
                <ItimText
                  size={12}
                  color="#555"
                  style={{ marginLeft: 5, flexShrink: 1 }}
                >
                  {store.address}
                </ItimText>
              </View>
            </View>
          </View>
        ))}

        {/* ✅ Spacer before button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ Mark as purchased button */}
      <View style={styles.footer}>
        <Pressable style={styles.purchaseButton}>
          <ItimText size={18} color="#fff" weight="bold">
            Mark as purchased!
          </ItimText>
        </Pressable>
      </View>

      {/* ✅ Bottom Navigation */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  logo: { marginBottom: 10 },
  section: { marginBottom: 10 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceInfo: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  storeInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  purchaseButton: {
    backgroundColor: '#197FF4',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 60,
    elevation: 3,
  },
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
