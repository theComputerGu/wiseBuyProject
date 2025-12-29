import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

import ItimText from "../../../components/Itimtext";
import BottomNav from "../../../components/Bottomnavigation";
import CheckoutCard from "../../../components/CheckoutCard";
import Title from "../../../components/Title";

const BRAND = "#197FF4";

import { RootState } from "../../../redux/state/store";
import { setActiveGroup } from "../../../redux/slices/groupSlice";
import { setActiveList } from "../../../redux/slices/shoppinglistSlice";
import { useAddToHistoryMutation } from "../../../redux/svc/groupsApi";
import { API_URL } from "@env";

/* ======================================================
   TYPES
====================================================== */

type Product = {
  itemcode: string;
  amount: number;
  price: number;
  _id: {
    title?: string;
    image?: string;
  };
};

/* ======================================================
   COMPONENT
====================================================== */

export default function StoreCheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { chain, address } = useLocalSearchParams<{
    chain?: string;
    address?: string;
  }>();

  const activeGroup = useSelector((s: RootState) => s.group.activeGroup);
  const shoppingList = useSelector((s: RootState) => s.shoppingList.activeList);
  const storesByItemcode = useSelector((s: RootState) => s.stores.stores);

  const items = shoppingList?.items ?? [];

  const [addToHistory] = useAddToHistoryMutation();

  /* =========================
     BUILD PRODUCTS FROM REDUX
  ========================= */

  const products: Product[] = useMemo(() => {
    if (!chain || !address) return [];

    const result: Product[] = [];

    for (const item of items) {
      const itemcode = item._id?.itemcode;
      if (!itemcode) continue;

      const entry = storesByItemcode[itemcode];
      if (!entry?.stores?.length) continue;

      const offer = entry.stores.find(
        (s) => s.chain === chain && s.address === address
      );

      if (!offer) continue;

      result.push({
        itemcode,
        amount: item.quantity ?? 1,
        price: offer.price,
        _id: item._id,
      });
    }

    return result;
  }, [items, storesByItemcode, chain, address]);

  /* =========================
     👉 NEW: MISSING PRODUCTS
     (בלי שינוי לוגיקה קיימת)
  ========================= */

  const missingProducts = useMemo(() => {
    return items.filter(
      (item) =>
        !products.some(
          (p) => p.itemcode === item._id.itemcode
        )
    );
  }, [items, products]);

  /* =========================
     TOTAL PRICE
  ========================= */

  const totalPrice = useMemo(() => {
    return products
      .reduce((sum, p) => sum + p.price * p.amount, 0)
      .toFixed(2);
  }, [products]);

  /* =========================
     IMAGE URL FIX
  ========================= */

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

  /* =========================
     CHECKOUT ACTION
  ========================= */

  const handleCheckout = async () => {
    if (!activeGroup) return;

    try {
      const res = await addToHistory({
        groupId: activeGroup._id,
        name: `Checkout ${new Date().toLocaleString()}`,
        storename: chain ?? "",
        storeadress: address ?? "",
        totalprice: +totalPrice,
        itemcount: products.reduce((s, p) => s + p.amount, 0),
      }).unwrap();

      dispatch(setActiveGroup(res.updatedGroup));
      dispatch(setActiveList(res.newList));

      router.replace("/main/history/history");
    } catch (err) {
      console.log("CHECKOUT ERROR:", err);
    }
  };

  /* =========================
     STORE NOT FOUND
  ========================= */

  if (!chain || !address) {
    return (
      <SafeAreaView style={styles.centerPage}>
        <ItimText size={18}>Store not found</ItimText>
        <Pressable onPress={() => router.back()}>
          <ItimText size={15} color="#197FF4">
            ← Go Back
          </ItimText>
        </Pressable>
      </SafeAreaView>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={BRAND} />
          </Pressable>
          <Title text={chain || "Store"} color={BRAND} />
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* AVAILABLE PRODUCTS */}
          {products.map((p) => (
            <CheckoutCard
              key={p.itemcode}
              name={p._id.title || `Item ${p.itemcode}`}
              quantity={p.amount}
              price={`₪${p.price}`}
              image={{ uri: fixImageURL(p._id.image) }}
            />
          ))}

          {/* 👉 NEW: MISSING PRODUCTS */}
          {missingProducts.length > 0 && (
            <>
              <ItimText
                size={16}
                weight="bold"
                style={{ marginBottom: 10, color: "#999" }}
              >
                מוצרים שלא זמינים בחנות
              </ItimText>

              {missingProducts.map((m) => (
                <CheckoutCard
                  key={`missing-${m._id.itemcode}`}
                  name={m._id.title || `Item ${m._id.itemcode}`}
                  quantity={m.quantity}
                  price="—"
                  image={{ uri: fixImageURL(m._id.image) }}
                  missing
                />
              ))}
            </>
          )}

          <View style={{ height: 25 }} />
        </ScrollView>

        <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
          <MaterialCommunityIcons name="cart-check" size={20} color="#fff" />
          <ItimText size={16} color="#fff" weight="600" style={{ marginLeft: 8 }}>
            אישור קניה • ₪{totalPrice}
          </ItimText>
        </Pressable>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkoutBtn: {
    flexDirection: "row",
    backgroundColor: BRAND,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
});
