import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import ItimText from "../../../components/Itimtext";
import Button from "../../../components/Button";
import BottomNav from "../../../components/Bottomnavigation";
import ProductCard from "../../../components/productcard";
import { setActiveGroup } from "../../../redux/slices/groupSlice";
import { setActiveList } from "../../../redux/slices/shoppinglistSlice";
import { useAddToHistoryMutation } from "../../../redux/svc/groupsApi";
import CheckoutCard from "../../../components/CheckoutCard";


import { useSelector } from "react-redux";
import { RootState } from "../../../redux/state/store";

export default function StoreCheckoutScreen() {
    const router = useRouter();
    const { name } = useLocalSearchParams();
    const storeName = name;
    const dispatch = useDispatch();
    const activeGroup = useSelector((s: RootState) => s.group.activeGroup);
    const shoppingList = useSelector((s: RootState) => s.shoppingList);
    const [addToHistory] = useAddToHistoryMutation();
    const items = shoppingList.activeList?.items ?? [];

    const handleCheckout = async () => {
        if (!activeGroup) return;

        try {
            const res = await addToHistory({
                groupId: activeGroup._id,
                name: `Checkout - ${new Date().toLocaleString()}`
            }).unwrap();

            dispatch(setActiveGroup(res.updatedGroup));
            dispatch(setActiveList(res.newList));
            router.replace("/main/history");

        } catch (err) {
            console.error("Checkout error:", err);
        }
    };

    const extractPrice = (raw: string | undefined): number => {
        if (!raw) return 0;

        // Extract the FIRST decimal or integer number in the string
        const match = raw.match(/\d+(\.\d+)?/);

        if (!match) return 0;

        return parseFloat(match[0]);
    };

    // 🔹 Calculate total price
    const totalPrice = items.reduce((sum: number, item: any) => {
        const price = extractPrice(item._id.pricerange);
        return sum + price * item.quantity;
    }, 0);

    // Change 127.0.0.1 to your computer LAN IP
    const fixImageURL = (url: any) => {
        if (!url) return "";

        try {
            const original = new URL(url);
            const backend = new URL(API_URL);

            // Replace only host + port
            original.host = backend.host;

            return original.toString();
        } catch (e) {
            return url; // fallback
        }
    };

  if (!store) {
    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.container}>

                {/* ---------- TOP BAR ---------- */}
                <View style={styles.topBar}>
                    <Pressable onPress={() => router.replace("/main/checkout/checkout")} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color="#197FF4" />
                    </Pressable>

                    <ItimText size={22} weight="bold" style={styles.storeTitle}>
                        {storeName}
                    </ItimText>
                    
                </View>

                {/* ---------- ITEM LIST ---------- */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {items.length === 0 ? (
                        <ItimText size={14} color="#777" style={{ textAlign: "center", marginTop: 20 }}>
                            No items in your shopping list yet.
                        </ItimText>
                    ) : (
                        items.map((item: any) => (
                            <CheckoutCard
                                key={item._id._id}
                                name={item._id.title}
                                quantity={item.quantity}
                                price={item._id.pricerange}
                                image={{ uri: fixImageURL(item._id.image) }}
                            />
                        ))
                    )}
                </ScrollView>

                {/* ---------- CHECKOUT BUTTON ---------- */}
                <Button title={`Confirm Purchase • ₪${totalPrice}`} onPress={handleCheckout} />

                <BottomNav />
            </View>
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
