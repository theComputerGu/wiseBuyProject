import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import ItimText from "../../../components/Itimtext";
import Button from "../../../components/Button";
import BottomNav from "../../../components/Bottomnavigation";
import ProductCard from "../../../components/productcard";

import { useSelector } from "react-redux";
import { RootState } from "../../../redux/state/store";

export default function StoreCheckoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // כל החנויות מתוך Redux
  const stores = useSelector((s: RootState) => s.checkout.stores);

  // מוצאים את החנות לפי ID
  const store = stores.find((s) => s.id === id);

  if (!store) {
    return (
      <SafeAreaView>
        <ItimText size={18} style={{ textAlign: "center", marginTop: 50 }}>
          Store not found
        </ItimText>
      </SafeAreaView>
    );
  }

  // חישוב מחירי סל
  const total = store.products.reduce(
    (sum, item) => sum + item.price * item.amount,
    0
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>

        {/* ---------- TOP BAR ---------- */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#197FF4" />
          </Pressable>

          <ItimText size={22} weight="bold" style={styles.storeTitle}>
            {store.chain}
          </ItimText>

          <View style={{ width: 26 }} />
        </View>

        <ItimText size={14} color="#444" style={{ textAlign: "center", marginBottom: 10 }}>
          {store.address}
        </ItimText>

        {/* ---------- PRODUCTS LIST ---------- */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {store.products.map((item) => (
            <ProductCard
              key={item.itemcode}
              name={`Item ${item.itemcode}`}
              quantity={item.amount}
              price={`₪${item.price}`}
              image={require("../../../assets/logos/logo blue.png")} // placeholder
            />
          ))}
        </ScrollView>

        {/* ---------- CONFIRM BUTTON ---------- */}
        <Button
          title={`Confirm Purchase • ₪${total.toFixed(2)}`}
          onPress={() => {
            console.log("Purchase confirmed for store:", store.id);
          }}
        />

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  /* TOP BAR */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 5,
  },

  backButton: {
    padding: 5,
  },

  scrollContent: {
    paddingBottom: 0,
  },

  storeTitle: {
    flex: 1,
    textAlign: "center",
  },
});
