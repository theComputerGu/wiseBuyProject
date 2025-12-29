import React, { useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";

import TopNav from "../../components/Topnav";
import BottomNav from "../../components/Bottomnavigation";
import BottomSummary from "../../components/BottomSummary";
import ProductCard from "../../components/productcard";
import Title from "../../components/Title";
import GroupSelector from "../../components/GroupSelector";


import { RootState } from "../../redux/state/store";
import {
  useLazyGetRecommendationsQuery,
} from "../../redux/svc/recommendationsApi";
import { setRecommendations } from "../../redux/slices/recommendedSlice";
import { API_URL } from "@env";

import {
  useAddItemMutation,
  useRemoveItemMutation,
} from "../../redux/svc/shoppinglistApi";

import {
  updateItem,
  removeItem,
  addItem,
} from "../../redux/slices/shoppinglistSlice";
import RecoCard from "../../components/RecoCard";
import { useLazyGetProductByIdQuery } from "../../redux/svc/productApi";

export default function ProductScreen() {
  const dispatch = useDispatch();

  /* =========================
     REDUX STATE
  ========================= */
  const shoppingList = useSelector((s: RootState) => s.shoppingList);
  const user = useSelector((s: RootState) => s.user);
  const recommended = useSelector(
    (s: RootState) => s.recommended.items
  );

  const items = shoppingList.activeList?.items ?? [];
  const userId = user.current?._id;
  const [fetchProductById] = useLazyGetProductByIdQuery();

  /* =========================
     STABLE LIST SIGNATURE
  ========================= */
  const listSignature = useMemo(() => {
    return (
      shoppingList.activeList?.items
        ?.filter(i => i && i._id && i._id._id)
        .map(i => `${i._id._id}:${i.quantity}`)
        .join("|") ?? ""
    );
  }, [shoppingList.activeList?.items]);

  /* =========================
     API (MANUAL)
  ========================= */
  const [
    triggerRecommendations,
    {
      data: recommendationsData,
      isFetching: recommendationsLoading,
    },
  ] = useLazyGetRecommendationsQuery();

  const [addItemToBackend] = useAddItemMutation();
  const [removeItemFromBackend] = useRemoveItemMutation();

  /* =========================
     EFFECT A: TRIGGER FETCH
  ========================= */
  useEffect(() => {
    if (!userId) return;
    triggerRecommendations(userId);
  }, [userId, listSignature, triggerRecommendations]);

  /* =========================
     EFFECT B: STORE RESULT
  ========================= */
  useEffect(() => {
    if (!recommendationsData) return;
    dispatch(setRecommendations(recommendationsData));
  }, [recommendationsData, dispatch]);

  /* =========================
     HANDLERS
  ========================= */
  const handleIncrease = async (productId: string) => {
    const listId = shoppingList.activeList?._id;
    if (!listId) return;

    const currentItem = shoppingList.activeList?.items.find(
      (i) => i._id._id === productId
    );

    try {
      const res = await addItemToBackend({ listId, productId }).unwrap();
      if (currentItem) {
        // 🔁 already exists → increase
        dispatch(
          updateItem({
            productId,
            patch: { quantity: currentItem.quantity + 1 },
          })
        );
      } else {
        const product = await fetchProductById(productId).unwrap();
        dispatch(
          addItem({
            _id: product,
            quantity: 1,
          })
        );
      }
    } catch (err) {
      console.error("❌ Add failed:", err);
    }
  };

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

  /* =========================
     IMAGE FIX
  ========================= */
  const fixImageURL = (url: any) => {
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

  /* =========================
     TOTALS
  ========================= */
  const totalPrice = items.reduce((sum, item: any) => {
    const price = parseFloat(
      item._id.pricerange?.replace(/[^\d.]/g, "") || "0"
    );
    return sum + price * item.quantity;
  }, 0);

  const totalItems = items.reduce(
    (sum: number, i: any) => sum + i.quantity,
    0
  );

  /* =========================
     UI
  ========================= */
  return (
    <SafeAreaView style={styles.container}>
      <TopNav />
      <GroupSelector />

      {/* SHOPPING LIST - takes remaining space */}
      <ScrollView
        style={styles.shoppingListScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {items.length === 0 ? (
          <Text style={styles.emptyText}>
            No items in your shopping list yet.
          </Text>
        ) : (
          items.map((item: any) => (
            <ProductCard
              key={item._id._id}
              name={item._id.title}
              quantity={item.quantity}
              price={item._id.pricerange}
              image={{ uri: fixImageURL(item._id.image) }}
              onIncrease={() => handleIncrease(item._id._id)}
              onDecrease={() => handleDecrease(item._id._id)}
            />
          ))
        )}
      </ScrollView>

      {/* RECOMMENDATIONS SECTION - fixed height above summary */}
      <View style={styles.recommendationsSection}>
        <Title text="Recommendations" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recoScroll}
          contentContainerStyle={styles.recoContent}
        >
          {recommended.map((rec: any) => (
            <RecoCard
              key={rec.productId}
              title={rec.title}
              price={rec.pricerange}
              image={{ uri: fixImageURL(rec.image) }}
              reason={rec.reason}
              onAdd={() => handleIncrease(rec.productId)}
            />
          ))}
        </ScrollView>
      </View>

      <BottomSummary
        amount={totalItems}
        price={totalPrice.toFixed(1)}
      />

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  shoppingListScroll: { flex: 1 },
  scrollContent: { paddingBottom: 10 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
  recommendationsSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  recoScroll: {
    height: 125,
  },
  recoContent: {
    paddingVertical: 5,
    paddingRight: 10,
  },
});
