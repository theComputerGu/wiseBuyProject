import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

import ItimText from "../../../components/Itimtext";
import Button from "../../../components/Button";
import BottomNav from "../../../components/Bottomnavigation";
import CheckoutCard from "../../../components/CheckoutCard";

import { RootState } from "../../../redux/state/store";
import { setActiveGroup } from "../../../redux/slices/groupSlice";
import { setActiveList } from "../../../redux/slices/shoppinglistSlice";
import { useAddToHistoryMutation } from "../../../redux/svc/groupsApi";
import { API_URL } from "@env";

type Product = {
  itemcode: string;
  amount: number;
  price: number;
  _id?: { image?: string };
};

type StoreData = {
  chain: string;
  products: Product[];
};

export default function StoreCheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // -----------------------------
  // GET NAVIGATION PARAMS
  // -----------------------------
  const { store } = useLocalSearchParams();
  const parsedStore: StoreData | null =
    store ? JSON.parse(store as string) : null;

  // -----------------------------
  // GLOBAL STATE
  // -----------------------------
  const activeGroup = useSelector((s: RootState) => s.group.activeGroup);
  const shoppingList = useSelector((s: RootState) => s.shoppingList);
  const [addToHistory] = useAddToHistoryMutation();

  // -----------------------------
  // UTILS
  // -----------------------------
  const fixImageURL = (url: string | undefined) => {
    if (!url) return "";
    try {
      const original = new URL(url);
      const backend = new URL(API_URL);
      original.host = backend.host;
      return original.toString();
    } catch {
      return url;
    }
  };

  const totalPrice = parsedStore
    ? parsedStore.products.reduce(
        (sum, item) => sum + item.price * item.amount,
        0
      )
    : 0;

  // -----------------------------
  // CHECKOUT HANDLER
  // -----------------------------
  const handleCheckout = async () => {
    if (!activeGroup) return;

    try {
      const res = await addToHistory({
        groupId: activeGroup._id,
        name: `Checkout - ${new Date().toLocaleString()}`,
      }).unwrap();

      dispatch(setActiveGroup(res.updatedGroup));
      dispatch(setActiveList(res.newList));

      router.replace("/main/history");
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  // -----------------------------
  // LOADING / ERROR STATE
  // -----------------------------
  if (!parsedStore) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <ItimText size={16} style={{ textAlign: "center", marginTop: 40 }}>
            No store data found.
          </ItimText>

          <Pressable
            onPress={() => router.back()}
            style={{ marginTop: 20, alignSelf: "center" }}
          >
            <ItimText size={16} color="#197FF4">
              Go Back
            </ItimText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        {/* ---------- TOP BAR ---------- */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.replace("/main/checkout/checkout")}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#197FF4"
            />
          </Pressable>

          <ItimText size={22} weight="bold" style={styles.storeTitle}>
            {parsedStore.chain}
          </ItimText>
        </View>

        {/* ---------- ITEM LIST ---------- */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {parsedStore.products.length === 0 ? (
            <ItimText
              size={14}
              color="#777"
              style={{ textAlign: "center", marginTop: 20 }}
            >
              No items to checkout.
            </ItimText>
          ) : (
            parsedStore.products.map((item) => (
              <CheckoutCard
                key={item.itemcode}
                name={`Item ${item.itemcode}`}
                quantity={item.amount}
                price={`₪${item.price}`}
                image={{ uri: fixImageURL(item._id?.image) }}
              />
            ))
          )}
        </ScrollView>

        {/* ---------- CHECKOUT BUTTON ---------- */}
        <Button
          title={`Confirm Purchase • ₪${totalPrice}`}
          onPress={handleCheckout}
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
    paddingBottom: 20,
  },

  storeTitle: {
    flex: 1,
    textAlign: "center",
  },
});
