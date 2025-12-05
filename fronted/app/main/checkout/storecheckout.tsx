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
  const items = shoppingList.activeList?.items ?? [];

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
    ).toFixed(2)
    : 0;

  // -----------------------------
  // CHECKOUT HANDLER
  // -----------------------------
  const handleCheckout = async () => {
    if (!activeGroup || !parsedStore) return;

    // Store name (chain)
    const storename = parsedStore.chain;

    // Store address (fix: DO NOT use chain)
    const storeadress = parsedStore.chain || "Unknown Address";

    // Total price is NOW NUMBER, not string
    const totalprice = parsedStore.products.reduce(
      (sum, item) => sum + item.price * item.amount,
      0
    );

    // Total item count (sum of quantities)
    const itemcount = parsedStore.products.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    try {
      const res = await addToHistory({
        groupId: activeGroup._id,
        name: `Checkout - ${new Date().toLocaleString()}`,
        storename,
        storeadress,
        totalprice,   
        itemcount,   
      }).unwrap();

      dispatch(setActiveGroup(res.updatedGroup));
      dispatch(setActiveList(res.newList));

      router.replace("/main/history/history");
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
            parsedStore.products.map((p) => {
              const original = shoppingList.activeList?.items.find(
                (i) => i._id.itemcode === p.itemcode
              );

              return (
                <CheckoutCard
                  key={p.itemcode}
                  name={original?._id.title || `Item ${p.itemcode}`}
                  quantity={p.amount}
                  price={`₪${p.price}`}
                  image={{ uri: fixImageURL(original?._id.image) }}
                />
              );
            })
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
