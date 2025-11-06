import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Platform, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopNav from "../components/Topnav";
import Title from "../components/Title";
import BottomNav from "../components/Bottomnavigation";
import BottomSummary from "../components/BottomSummary";
import ProductCard from "../components/productcard";

const BASE_URL = "http://192.168.30.122:3000";

type ServerProduct = {
  _id: string;
  title: string;
  price: number;
  currency?: string;
  rating?: number;
  images?: string[];
};

type CardItem = {
  id: string | number;
  name: string;
  price: string;     // "6.94₪"
  image?: any;       // { uri: ... } או require()
  quantity: number;
  averageLabel: string;
  uploaderAvatar?: any;
  uploaderName?: string;
};

export default function ProductScreen() {
  const [items, setItems] = useState<CardItem[]>([]);
  const [reco, setReco] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fmtPrice = (n: number, currency = "₪") => `${n.toFixed(2)}${currency}`;
  const parsePrice = (s: string) => parseFloat(s.replace(/[^\d.]/g, ""));

  const inc = (setList: React.Dispatch<any>, index: number) =>
    setList((arr: any[]) => {
      const copy = [...arr];
      copy[index] = { ...copy[index], quantity: copy[index].quantity + 1 };
      return copy;
    });

  const dec = (setList: React.Dispatch<any>, index: number) =>
    setList((arr: any[]) => {
      const copy = [...arr];
      const q = copy[index].quantity;
      copy[index] = { ...copy[index], quantity: Math.max(0, q - 1) };
      return copy;
    });

  const totalQty =
    items.reduce((s, it) => s + it.quantity, 0) +
    reco.reduce((s, it) => s + it.quantity, 0);

  const totalPrice =
    items.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0) +
    reco.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${BASE_URL}/products`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ServerProduct[] = await res.json();
      console.log("Fetched /products:", data); // 🔎 לוג בדיקה

      // ממפה לתצורת ה-Card שלך + תמונת fallback מקומית אם אין URL
      const mapped: CardItem[] = data.map((p) => ({
        id: p._id,
        name: p.title,
        price: fmtPrice(p.price, (!p.currency || p.currency === "ILS") ? "₪" : ` ${p.currency}`),
        image: p.images?.[0] ? { uri: p.images[0] } : require("../assets/icon2.png"),
        quantity: 0,
        averageLabel: "מחיר ממוצע",
        uploaderAvatar: require("../assets/icon2.png"),
        uploaderName: "System",
      }));

      // אם אין כלום בשרת, נראה לפחות משהו (fallback לוקאלי)
      if (mapped.length === 0) {
        console.warn("No products from server; showing fallback.");
        const fallback: CardItem[] = [
          {
            id: "fallback-1",
            name: "חלב תנובה 1% ליטר",
            price: fmtPrice(6.94),
            image: require("../assets/icon2.png"),
            quantity: 0,
            averageLabel: "מחיר ממוצע",
            uploaderAvatar: require("../assets/icon2.png"),
            uploaderName: "System",
          },
        ];
        setItems(fallback);
        setReco([]);
        return;
      }

      // להצגה פשוטה: הכל ב-items (בלי “המלצות” כרגע)
      setItems(mapped);
      setReco([]);
    } catch (e: any) {
      console.error("Failed to fetch /products:", e);
      setErr(e?.message ?? "Failed to load");
      // fallback לוקאלי כדי שתראה משהו גם בשגיאה
      setItems([
        {
          id: "fallback-err",
          name: "Milk (fallback)",
          price: fmtPrice(5.9),
          image: require("../assets/icon2.png"),
          quantity: 0,
          averageLabel: "מחיר ממוצע",
          uploaderAvatar: require("../assets/icon2.png"),
          uploaderName: "System",
        },
      ]);
      setReco([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNav />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>טוען מוצרים…</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />
      <Title text="Sean and mark home" />

      {err && (
        <Text style={{ color: "crimson", marginBottom: 8 }}>
          שגיאת רשת: {err}
        </Text>
      )}

      {items.length === 0 && reco.length === 0 ? (
        <View style={{ padding: 16 }}>
          <Text>אין מוצרים להצגה.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {items.map((p, i) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              image={p.image}
              quantity={p.quantity}
              averageLabel={p.averageLabel}
              uploaderAvatar={p.uploaderAvatar}
              uploaderName={p.uploaderName}
              onIncrease={() => inc(setItems, i)}
              onDecrease={() => dec(setItems, i)}
            />
          ))}

          {reco.length > 0 && <Title text="Recommendation's" />}

          {reco.map((p, i) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              image={p.image}
              quantity={p.quantity}
              averageLabel={p.averageLabel}
              uploaderAvatar={p.uploaderAvatar}
              uploaderName={p.uploaderName}
              onIncrease={() => inc(setReco, i)}
              onDecrease={() => dec(setReco, i)}
            />
          ))}

          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      <BottomSummary
        amount={
          items.reduce((s, it) => s + it.quantity, 0) +
          reco.reduce((s, it) => s + it.quantity, 0)
        }
        price={
          Number((
            items.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0) +
            reco.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0)
          ).toFixed(2))
        }
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 0 },
});
