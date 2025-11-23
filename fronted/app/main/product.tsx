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

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/state/store";

import {
  useAddItemMutation,
  useRemoveItemMutation,
} from "../../redux/svc/shoppinglistApi";

import {
  updateItem,
  removeItem,
} from "../../redux/slices/shoppinglistSlice";

export default function ProductScreen() {
  const dispatch = useDispatch();

  const shoppingList = useSelector((s: RootState) => s.shoppingList);
  const user = useSelector((s: RootState) => s.user);
  const activeGroup = useSelector((s: RootState) => s.group);

  const items = shoppingList.activeList?.items ?? [];
  console.log("Shopping List Items:", JSON.stringify(items, null, 2));

  const [addItemToBackend] = useAddItemMutation();
  const [removeItemFromBackend] = useRemoveItemMutation();

  // 🔹 PLUS
  const handleIncrease = async (productId: string) => {
    const listId = shoppingList.activeList?._id;
    if (!listId) return;

    const currentItem = shoppingList.activeList?.items.find(
      (i) => i._id._id === productId
    );

    try {
      await addItemToBackend({ listId, productId }).unwrap();

      if (currentItem) {
        dispatch(
          updateItem({
            productId,
            patch: { quantity: currentItem.quantity + 1 },
          })
        );
      }

    } catch (err) {
      console.error("❌ Increase failed:", err);
    }
  };

  // 🔹 MINUS
  const handleDecrease = async (productId: string) => {
    const listId = shoppingList.activeList?._id;
    if (!listId) return;

    const currentItem = shoppingList.activeList?.items.find(
      (i) => i._id._id === productId
    );

    if (!currentItem) return;

    try {
      await removeItemFromBackend({
        listId,
        itemId: currentItem._id._id,
      }).unwrap();

      const newQty = currentItem.quantity - 1;

      if (newQty <= 0) {
        dispatch(removeItem(productId));
      } else {
        dispatch(
          updateItem({
            productId,
            patch: { quantity: newQty },
          })
        );
      }

    } catch (err) {
      console.error("❌ Decrease failed:", err);
    }
  };

  // 🔹 חישוב סכום כולל אמיתי
  const totalPrice = items.reduce((sum, item: any) => {
    const price = parseFloat(
      item._id.pricerange?.replace(/[^\d.]/g, "") || "0"
    );
    return sum + price * item.quantity;
  }, 0);

  // 🔹 חישוב כמות כללית
  const totalItems = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

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
              price={item._id.pricerange}
              image={{ uri: item._id.image }}
              onIncrease={() => handleIncrease(item._id._id)}
              onDecrease={() => handleDecrease(item._id._id)}
            />
          ))
        )}
      </ScrollView>

      <Title text="Recommendation's" />
      <ScrollView horizontal></ScrollView>

      <BottomSummary
        amount={totalItems}
        price={totalPrice.toFixed(2)}
      />

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 0 },
});
