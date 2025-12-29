import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Pressable,
  Animated,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '@env';

import ItimText from '../../../components/Itimtext';
import Title from '../../../components/Title';

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

const BRAND = '#197FF4';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => router.replace('/main/additem/additem')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={BRAND} />
          </Pressable>
          <View style={styles.titleContainer}>
            <Title text={name ?? 'Category'} color={BRAND} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={BRAND} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="package-variant" size={20} color={BRAND} />
          <ItimText size={16} weight="600" color="#1a1a1a" style={{ marginLeft: 8 }}>
            Products
          </ItimText>
          <View style={styles.countBadge}>
            <ItimText size={12} color={BRAND} weight="bold">
              {products.length}
            </ItimText>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND} />
            <ItimText size={14} color="#71717a" style={{ marginTop: 12 }}>
              Loading products...
            </ItimText>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant-remove" size={60} color="#d1d5db" />
            <ItimText size={16} color="#71717a" style={{ marginTop: 12, textAlign: 'center' }}>
              No products found
            </ItimText>
            <ItimText size={13} color="#9ca3af" style={{ marginTop: 4, textAlign: 'center' }}>
              Try a different search term
            </ItimText>
          </View>
        ) : (
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={(item) => String(item._id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => {
              const qty = getCurrentQty(item._id);
              return (
                <Pressable
                  style={styles.itemCard}
                  onPress={() => openPopup(item)}
                >
                  {qty > 0 && (
                    <View style={styles.qtyBadge}>
                      <ItimText size={12} color="#fff" weight="bold">
                        {qty}
                      </ItimText>
                    </View>
                  )}
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: fixImageURL(item.image) }}
                      style={styles.itemImage}
                    />
                  </View>
                  <ItimText
                    size={14}
                    color="#1a1a1a"
                    weight="600"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={styles.itemTitle}
                  >
                    {item.title}
                  </ItimText>
                  <ItimText size={14} color={BRAND} weight="bold">
                    {item.pricerange ?? ''}
                  </ItimText>
                </Pressable>
              );
            }}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1a1a1a',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  qtyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  itemTitle: {
    width: '100%',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 6,
    minHeight: 36,
  },
});
