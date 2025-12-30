import React, { useEffect, useMemo } from "react";
import {View,StyleSheet,ScrollView,ActivityIndicator,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TopNav from "../../components/Topnav";
import BottomNav from "../../components/Bottomnavigation";
import BottomSummary from "../../components/BottomSummary";
import ProductCard from "../../components/productcard";
import GroupSelector from "../../components/GroupSelector";
import ItimText from "../../components/Itimtext";
import { RootState } from "../../redux/state/store";
import {useLazyGetRecommendationsQuery,} from "../../redux/svc/recommendationsApi";
import { setRecommendations } from "../../redux/slices/recommendedSlice";
import { API_URL } from "@env";
import {useAddItemMutation,useRemoveItemMutation,} from "../../redux/svc/shoppinglistApi";
import {updateItem,removeItem,addItem,} from "../../redux/slices/shoppinglistSlice";
import RecoCard from "../../components/RecoCard";
import { useLazyGetProductByIdQuery } from "../../redux/svc/productApi";

const BRAND = "#197FF4";





export default function ProductScreen() {


  const dispatch = useDispatch();

  const shoppingList = useSelector((s: RootState) => s.shoppingList);
  const user = useSelector((s: RootState) => s.user);
  const recommended = useSelector((s: RootState) => s.recommended.items);

  const items = shoppingList.activeList?.items ?? [];
  const userId = user.current?._id;
  const [fetchProductById] = useLazyGetProductByIdQuery();


  const listSignature = useMemo(() => {
    return (
      shoppingList.activeList?.items
        ?.filter(i => i && i._id && i._id._id)
        .map(i => `${i._id._id}:${i.quantity}`)
        .join("|") ?? ""
    );
  }, [shoppingList.activeList?.items]);


  const [triggerRecommendations,{data: recommendationsData,isFetching: recommendationsLoading,},] = useLazyGetRecommendationsQuery();

  const [addItemToBackend] = useAddItemMutation();
  const [removeItemFromBackend] = useRemoveItemMutation();






  useEffect(() => {
    if (!userId) return;
    triggerRecommendations(userId);
  }, [userId, listSignature, triggerRecommendations]);





  useEffect(() => {
    if (!recommendationsData) return;
    dispatch(setRecommendations(recommendationsData));
  }, [recommendationsData, dispatch]);







  const handleIncrease = async (productId: string) => {
    const listId = shoppingList.activeList?._id;
    if (!listId) return;

    const currentItem = shoppingList.activeList?.items.find(
      (i) => i._id._id === productId
    );

    try {
      const res = await addItemToBackend({ listId, productId }).unwrap();
      if (currentItem) {
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
      console.error("Add failed:", err);
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
      console.error("Decrease failed:", err);
    }
  };






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







  return (
    <SafeAreaView style={styles.container}>
      <TopNav />
      <GroupSelector />

      {/* Shopping List Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <MaterialCommunityIcons name="cart-outline" size={18} color={BRAND} />
        </View>
        <ItimText size={16} weight="600" color="#1a1a1a" style={{ marginLeft: 10 }}>
          Shopping List
        </ItimText>
        {items.length > 0 && (
          <View style={styles.countBadge}>
            <ItimText size={12} color={BRAND} weight="bold">
              {totalItems}
            </ItimText>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.shoppingListScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="cart-off" size={50} color="#d1d5db" />
            </View>
            <ItimText size={16} color="#71717a" style={{ marginTop: 16 }}>
              Your shopping list is empty
            </ItimText>
            <ItimText size={13} color="#9ca3af" style={{ marginTop: 4, textAlign: "center" }}>
              Add items to start building your list
            </ItimText>
          </View>
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

      {/* Recommendations Section */}
      <View style={styles.recommendationsSection}>
        <View style={styles.recoHeader}>
          <View style={styles.sectionIconContainer}>
            <MaterialCommunityIcons name="lightbulb-outline" size={18} color={BRAND} />
          </View>
          <ItimText size={16} weight="600" color="#1a1a1a" style={{ marginLeft: 10 }}>
            Recommendations
          </ItimText>
          {recommendationsLoading && (
            <ActivityIndicator size="small" color={BRAND} style={{ marginLeft: 10 }} />
          )}
        </View>

        {recommended.length === 0 ? (
          <View style={styles.emptyRecoContainer}>
            <ItimText size={13} color="#9ca3af">
              No recommendations available
            </ItimText>
          </View>
        ) : (
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
        )}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: "auto",
  },
  // Shopping List
  shoppingListScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  // Recommendations Section
  recommendationsSection: {
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
    paddingTop: 12,
  },
  recoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyRecoContainer: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  recoScroll: {
    height: 130,
  },
  recoContent: {
    paddingVertical: 5,
    paddingRight: 10,
    gap: 12,
  },
});
