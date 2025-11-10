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
import { API_URL } from '@env';


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
  price: string;
  image?: any;
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

  const fmtPrice = (n: number, currency = "₪") =>
    `${n.toFixed(2)}${currency}`;
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // שולף במקביל את כל המוצרים + ההמלצות
      const [resProducts, resReco] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/products/recommendations`),
      ]);

      if (!resProducts.ok || !resReco.ok)
        throw new Error("HTTP error fetching products");

      const products: ServerProduct[] = await resProducts.json();
      const recos: ServerProduct[] = await resReco.json();

      const toCard = (p: ServerProduct): CardItem => ({
        id: p._id,
        name: p.title,
        price: fmtPrice(p.price),
        image: p.images?.[0]
          ? { uri: p.images[0] }
          : require("../../assets/icon2.png"),
        quantity: 0,
        averageLabel: "מחיר ממוצע",
        uploaderAvatar: require("../../assets/icon2.png"),
        uploaderName: "System",
      });

      setItems(products.map(toCard));
      setReco(recos.map(toCard));
    } catch (e: any) {
      console.error("❌ Failed to fetch:", e);
      setErr(e?.message ?? "Failed to load");
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- כל המוצרים --- */}
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

        {/* --- כותרת והמלצות --- */}
        <Title text="Recommendation's" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {reco.map((p, i) => (
            <View key={p.id} style={{ marginRight: 10 }}>
              <ProductCard
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
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 110 }} />
      </ScrollView>

      <BottomSummary
        amount={
          items.reduce((s, it) => s + it.quantity, 0) +
          reco.reduce((s, it) => s + it.quantity, 0)
        }
        price={Number(
          (
            items.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0) +
            reco.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0)
          ).toFixed(2)
        )}
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 0 },
});
