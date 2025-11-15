import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNav from "../../components/Topnav";
import Title from "../../components/Title";
import BottomNav from "../../components/Bottomnavigation";
import BottomSummary from "../../components/BottomSummary";
import ProductCard from "../../components/productcard";
import { API_URL } from "@env";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/state/store";

//
// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────
//

export type Item = {
  id: string | number;
  name: string;
  price: string;
  image: any;
  quantity: number;
  averageLabel: string;
  uploaderAvatar: any;
  uploaderName: string;
};

//
// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
//

export default function ProductScreen() {
  const { activeListId, activePurchaseNumber } = useSelector(
    (s: RootState) => s.shoppingSession
  );

  const listId = activeListId;
  const purchaseNumber = activePurchaseNumber;

  const [items, setItems] = useState<Item[]>([]);
  const [reco, setReco] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fmtPrice = (n: number, currency = "₪") => `${n.toFixed(2)}${currency}`;
  const parsePrice = (s: string) => parseFloat(s.replace(/[^\d.]/g, ""));

  //
  // ────────────────────────────────
  //  INC / DEC
  // ────────────────────────────────
  //

  const inc = (
    setList: React.Dispatch<React.SetStateAction<Item[]>>,
    index: number
  ) =>
    setList((arr) => {
      const copy = [...arr];
      copy[index].quantity++;
      return copy;
    });

  const dec = (
    setList: React.Dispatch<React.SetStateAction<Item[]>>,
    index: number
  ) =>
    setList((arr) => {
      const copy = [...arr];
      copy[index].quantity = Math.max(0, copy[index].quantity - 1);
      return copy;
    });

  //
  // ────────────────────────────────
  //  FETCH HISTORY LIST
  // ────────────────────────────────
  //

  const fetchHistoryList = useCallback(async () => {
    if (!listId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/shopping-lists/${listId}`);
      const list = await res.json();

      const formatted: Item[] = list.items.map((i: any) => ({
        id: i.productId ?? Math.random(),
        name: i.nameSnapshot ?? "Unknown",
        price: fmtPrice(i.pricePerUnit),
        image: require("../../assets/icon2.png"),
        quantity: i.quantity,
        averageLabel: "מהיסטוריה",
        uploaderAvatar: require("../../assets/icon2.png"),
        uploaderName: "History",
      }));

      setItems(formatted);
      setReco([]);
    } catch (e) {
      setErr("Failed to load history list");
    } finally {
      setLoading(false);
    }
  }, [listId]);

  //
  // ────────────────────────────────
  //  FETCH PRODUCTS
  // ────────────────────────────────
  //

  const toCard = (p: any): Item => ({
    id: p._id,
    name: p.title,
    price: fmtPrice(p.price),
    image: p.images?.[0] ? { uri: p.images[0] } : require("../../assets/icon2.png"),
    quantity: 0,
    averageLabel: "מחיר ממוצע",
    uploaderAvatar: require("../../assets/icon2.png"),
    uploaderName: "System",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const [resProducts, resReco] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/products/recommendations`),
      ]);

      const products = await resProducts.json();
      const recos = await resReco.json();

      setItems(products.map(toCard));
      setReco(recos.map(toCard));
    } catch (e) {
      setErr("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  //
  // ────────────────────────────────
  //  USE EFFECT
  // ────────────────────────────────
  //

  useEffect(() => {
    // 🟢 מסך נקי אחרי Sign In – לא טוען כלום
    if (listId === null || listId === undefined) {
      setLoading(false);
      return;
    }

    // 🟢 היסטוריה לפי קבוצה
    if (listId) {
      fetchHistoryList();
      return;
    }

    // 🟢 מוצרים רגילים
    fetchProducts();
  }, [listId]);

  //
  // ────────────────────────────────
  //  EMPTY SCREEN BEFORE FIRST LOAD
  // ────────────────────────────────
  //

  if (!listId && items.length === 0 && reco.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNav />
        <View style={{ flex: 1 }} />
        <BottomNav />
      </SafeAreaView>
    );
  }

  //
  // ────────────────────────────────
  //  LOADING SCREEN
  // ────────────────────────────────
  //

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNav />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
          <Text>טוען מוצרים…</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  //
  // ────────────────────────────────
  //  MAIN UI
  // ────────────────────────────────
  //

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />

      <Title text={listId ? `Purchase #${purchaseNumber}` : "Products"} />

      {err && <Text style={{ color: "red" }}>{err}</Text>}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {items.map((p, i) => (
          <ProductCard
            key={p.id}
            {...p}
            onIncrease={() => inc(setItems, i)}
            onDecrease={() => dec(setItems, i)}
          />
        ))}

        {!listId && (
          <>
            <Title text="Recommendation's" />
            <ScrollView horizontal>
              {reco.map((p, i) => (
                <View key={p.id} style={{ marginRight: 10 }}>
                  <ProductCard
                    {...p}
                    onIncrease={() => inc(setReco, i)}
                    onDecrease={() => dec(setReco, i)}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomSummary
        amount={items.reduce((s, it) => s + it.quantity, 0)}
        price={Number(
          items
            .reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0)
            .toFixed(2)
        )}
      />

      <BottomNav />
    </SafeAreaView>
  );
}

//
// ──────────────────────────────────
//  STYLES
// ──────────────────────────────────
//

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 0 },
});
