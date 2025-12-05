import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import axios from "axios";

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@env'

import ItimText from '../../../components/Itimtext';
import Title from '../../../components/Title';
import SearchHeader from '../../../components/SearchHeader';

import { useGetProductsQuery } from '../../../redux/svc/productApi';
import { useDispatch, useSelector } from 'react-redux';

import ItemPopup from "../../../components/itempopup";

import {
  addItem as addItemLocal,
  updateItem,
  removeItem as removeItemLocal,
} from '../../../redux/slices/shoppinglistSlice';

import {
  useAddItemMutation,
  useRemoveItemMutation,
} from '../../../redux/svc/shoppinglistApi';


const screenHeight = Dimensions.get('window').height;

export default function AddItemCategoryScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const dispatch = useDispatch();
  const shoppingListState = useSelector((s: any) => s.shoppingList);

  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useGetProductsQuery({
    category: name,
    q: search,
  });

  const fixImageURL = (url: any) => {
    if (!url) return "";

    try {
      const original = new URL(url);
      const backend = new URL(API_URL);
      original.host = backend.host;
      return original.toString();
    } catch (e) {
      return url;
    }
  };

  const [addItemToBackend] = useAddItemMutation();
  const [removeItemFromBackend] = useRemoveItemMutation();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const openPopup = (item: any) => {
    setSelectedItem(item);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const closePopup = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedItem(null));
  };

  const getCurrentQty = (productId: string): number => {
    const item = shoppingListState.activeList?.items?.find(
      (i: any) => i?._id?._id === productId
    );
    return item?.quantity || 0;
  };

  const increment = async () => {
    if (!selectedItem) return;

    const productId = selectedItem._id;
    const listId = shoppingListState.activeList?._id;

    if (!listId) return;

    const currentQty = getCurrentQty(productId);
    const newQty = currentQty + 1;

    try {


      if (currentQty === 0) {
        dispatch(
          addItemLocal({
            _id: selectedItem,
            quantity: 1,
          })
        );
      } else {
        dispatch(
          updateItem({
            productId,
            patch: { quantity: newQty },
          })
        );
      }

      await addItemToBackend({ listId, productId }).unwrap();

    } catch (err) {
      console.error("❌ Increment failed:", err);
    }
  };

  const decrement = async () => {
    if (!selectedItem) return;

    const productId = selectedItem._id;
    const listId = shoppingListState.activeList?._id;

    if (!listId) return;

    const listItem = shoppingListState.activeList?.items?.find(
      (i: any) => i?._id?._id === productId
    );

    if (!listItem) return;

    const itemId = listItem._id._id;
    const newQty = listItem.quantity - 1;

    try {


      if (newQty <= 0) {
        dispatch(removeItemLocal(productId));
      } else {
        dispatch(
          updateItem({
            productId,
            patch: { quantity: newQty },
          })
        );
      }
      await removeItemFromBackend({ listId, itemId }).unwrap();

    } catch (err) {
      console.error("❌ Decrement failed:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <SearchHeader
        placeholder="Search products..."
        backRoute="/main/additem/additem"
        value={search}
        onSearchChange={setSearch}
      />

      <Title text={name ?? 'Category'} />

      {isLoading ? (
        <ItimText size={16}>Loading...</ItimText>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => String(item._id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.itemCard}
              onPress={() => openPopup(item)}
            >
              <Image
                source={{ uri: fixImageURL(item.image) }}
                style={styles.itemImage}
              />

              {/* FIXED TITLE */}
              <ItimText
                size={16}
                color="#000"
                weight="bold"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={styles.itemTitle}
              >
                {item.title}
              </ItimText>

              <ItimText size={14} color="#197FF4">
                {item.pricerange ?? ''}
              </ItimText>
            </Pressable>
          )}
        />
      )}

      <ItemPopup
        visible={!!selectedItem}
        item={selectedItem}
        slideAnim={slideAnim}
        onClose={closePopup}
        onIncrement={increment}
        onDecrement={decrement}
        getCurrentQty={getCurrentQty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  list: {
    paddingVertical: 12,
  },

  /** PRODUCT CARD */
  itemCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    margin: 8,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  /** FIXED IMAGE — SAME SIZE ALWAYS */
  itemImage: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginBottom: 8,
  },

  /** FIXED PRODUCT TITLE */
  itemTitle: {
    width: "90%",
    textAlign: "center",
    marginBottom: 4,
  },
});
