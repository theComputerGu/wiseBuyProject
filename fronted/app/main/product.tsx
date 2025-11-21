import React from "react";
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
import { useSelector } from "react-redux";
import { RootState } from "../../redux/state/store";

export default function ProductScreen() {
  const shoppingList = useSelector((s: RootState) => s.shoppingList);
  const user = useSelector((s: RootState) => s.user);
  const activeGroup = useSelector((s: RootState) => s.group);

  const items = shoppingList.activeList?.items ?? [];
  console.log("Shopping List Items:", JSON.stringify(items, null, 2));

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />

      <Title text={activeGroup.activeGroup?.name ?? ""} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {items.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            No items in your shopping list yet.
          </Text>
        ) : (
          items.map((item: any) => (
            <ProductCard
              key={item.productId}
              name={item?.product?.name ?? "Unnamed"}
              quantity={item.quantity}
              price={item?.product?.price ?? 0}
              image={item.imageUrl ?? null}
            />
          ))
        )}
      </ScrollView>

      <Title text="Recommendation's" />
      <ScrollView horizontal></ScrollView>

      <BottomSummary
        amount={items.length}
        price={shoppingList.activeList?.total ?? 0}
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
