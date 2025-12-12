// ===================== StoreCheckoutScreen.tsx =====================

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

// =======================================================
//       TYPES
// =======================================================
type Product = {
  itemcode: string;
  amount: number;
  price: number;
  _id?: { image?: string; title?: string };
};

type StoreData = {
  chain: string;
  products: Product[];
};

// =======================================================
//       MAIN COMPONENT
// =======================================================
export default function StoreCheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { store } = useLocalSearchParams();
  const storeData: StoreData | null = store ? JSON.parse(store as string) : null;

  const activeGroup = useSelector((s: RootState) => s.group.activeGroup);
  const shoppingList = useSelector((s: RootState) => s.shoppingList.activeList);
  const items = shoppingList?.items ?? [];

  const [addToHistory] = useAddToHistoryMutation();


  // Fix URLs for images
  const fixImageURL = (url?: string) => {
    if (!url) return "";
    try {
      const origin = new URL(url);
      const backend = new URL(API_URL);
      origin.host = backend.host;
      return origin.toString();
    } catch {
      return url;
    }
  };

  const totalPrice = storeData
    ? storeData.products.reduce((sum, i) => sum + i.price * i.amount, 0).toFixed(2)
    : "0.00";

  // Missing products
  const missingProducts = items.filter(
    i => !storeData?.products.some(p => p.itemcode === i._id.itemcode)
  );


  // SAVE HISTORY
  const handleCheckout = async () => {
    if (!storeData || !activeGroup) return;

    try {
      const res = await addToHistory({
        groupId: activeGroup._id,
        name: `Checkout ${new Date().toLocaleString()}`,
        storename: storeData.chain,
        storeadress: storeData.chain,
        totalprice: +totalPrice,
        itemcount: storeData.products.reduce((s, i) => s + i.amount, 0),
      }).unwrap();

      dispatch(setActiveGroup(res.updatedGroup));
      dispatch(setActiveList(res.newList));

      router.replace("/main/history/history");
    } catch (err) {
      console.log("CHECKOUT ERROR:", err);
    }
  };


  // If store missing
  if (!storeData)
    return (
      <SafeAreaView style={styles.centerPage}>
        <ItimText size={18}>Store not found</ItimText>
        <Pressable onPress={() => router.back()}>
          <ItimText size={15} color="#197FF4">← Go Back</ItimText>
        </Pressable>
      </SafeAreaView>
    );


  // =======================================================
  //      UI
  // =======================================================
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>

        <View style={styles.top}>
          <Pressable onPress={() => router.replace("/main/checkout/checkout")}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#197FF4" />
          </Pressable>
          <ItimText size={20} weight="bold">{storeData.chain}</ItimText>
        </View>


        <ScrollView showsVerticalScrollIndicator={false}>
          {/* AVAILABLE ITEMS */}
          {storeData.products.map(p => {
            const ref = items.find(i => i._id.itemcode === p.itemcode);
            return (
              <CheckoutCard
                key={p.itemcode}
                name={ref?._id.title || `Item ${p.itemcode}`}
                quantity={p.amount}
                price={`₪${p.price}`}
                image={{ uri: fixImageURL(ref?._id.image) }}
              />
            );
          })}

          {/* MISSING ITEMS */}
          {missingProducts.length > 0 && (
            <View style={styles.missingBox}>
              <ItimText size={16} weight="bold" color="#c40000">
                ❗ מוצרים שלא נמצאו בסניף
              </ItimText>

              {missingProducts.map(m => (
                <View style={styles.missingRow} key={m._id.itemcode}>
                  <ItimText size={14}>{m._id.title}</ItimText>
                  <ItimText size={14} color="#c40000" weight="bold">× {m.quantity}</ItimText>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 25 }} />
        </ScrollView>

        <Button title={`אישור קניה • ₪${totalPrice}`} onPress={handleCheckout} />
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}


// =======================================================
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20 },
  centerPage: { flex: 1, justifyContent: "center", alignItems: "center" },

  top: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 10, marginTop: 5 },

  missingBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffe5e5",
    borderLeftWidth: 4,
    borderLeftColor: "#c40000"
  },
  missingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
});
