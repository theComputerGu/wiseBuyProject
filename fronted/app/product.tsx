// app/product.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopNav from "../components/Topnav";
import Title from "../components/Title";
import BottomNav from "../components/Bottomnavigation";
import BottomSummary from "../components/BottomSummary";

// ודא שהנתיב תואם לשם הקובץ בפועל (productcard.tsx או ProductCard.tsx)
import ProductCard from "../components/productcard";

export default function ProductScreen() {
  // --- Demo data (שלב ראשון: לוקאלי, אח"כ נחבר לשרת) ---
  const [items, setItems] = useState([
    {
      id: 1,
      name: "חלב תנובה 1% ליטר",
      price: "6.94₪",
      averageLabel: "מחיר ממוצע",
      image: require("../assets/products/חלב תנובה.png"),
      quantity: 1,
      uploaderAvatar: require("../assets/icon2.png"), // ← עדכן נתיב/קובץ קיים
      uploaderName: "Sean",
    },
    {
      id: 2,
      name: "חלב טרה 3% ליטר",
      price: "14.86₪",
      averageLabel: "מחיר ממוצע",
      image: require("../assets/products/חלב טרה.png"),
      quantity: 2,
      uploaderAvatar: require("../assets/icon2.png"), // ← עדכן נתיב/קובץ קיים
      uploaderName: "Mark",
    },
  ]);

  const [reco, setReco] = useState([
    {
      id: 3,
      name: "חלב יטבתה 3% ליטר",
      price: "5.94₪",
      averageLabel: "מחיר ממוצע",
      image: require("../assets/products/חלב יטבתה.jpeg"),
      quantity: 0,
      uploaderAvatar: require("../assets/icon2.png"), // ← עדכן נתיב/קובץ קיים
      uploaderName: "System",
    },
  ]);

  // --- Helpers ---
  const parsePrice = (s: string) => parseFloat(s.replace(/[^\d.]/g, "")); // "6.94₪" -> 6.94

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

  // סכום מחיר*כמות לכל הרשימות
  const totalPrice =
    items.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0) +
    reco.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />
      <Title text="Sean and mark home" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        <Title text="Recommendation's" />

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

        {/* רווח כדי ש-BottomSummary / BottomNav לא יחפפו את הרשימה */}
        <View style={{ height: 110 }} />
      </ScrollView>

      <BottomSummary amount={totalQty} price={Number(totalPrice.toFixed(2))} />
      <BottomNav/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 0 },
});
