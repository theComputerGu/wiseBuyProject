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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import ItimText from '../../../components/Itimtext';
import Title from '../../../components/Title';
import SearchHeader from '../../../components/SearchHeader';
import ItemPopup from "../../../components/itempopup";

import {
    addItemLocal,
    removeItemLocal,
} from '../../../redux/slices/shoppinglistSlice';
import {
  useAddItemMutation,
  useRemoveItemMutation,
} from '../../../redux/svc/shoppinglistApi';
import { useGetProductsQuery } from '../../../redux/svc/productApi';

const screenHeight = Dimensions.get('window').height;

export default function AddItemCategoryScreen() {
    const router = useRouter();
    const { name } = useLocalSearchParams<{ name?: string }>();
    const dispatch = useDispatch();
    const shoppingListState = useSelector((s: any) => s.shoppingList);

    const { data: products = [], isLoading } = useGetProductsQuery({
        category: name,
    });

    const [addItemToBackend] = useAddItemMutation();
    const [removeItemFromBackend] = useRemoveItemMutation();

    const [selectedItem, setSelectedItem] = useState<any>(null);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;

    // ------------------ POPUP ------------------
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

    // ------------------ HELPERS ------------------
    const getCurrentQty = (productId: string): number => {
        const item = shoppingListState.activeList?.items?.find(
            (i: any) => i._id._id === productId
        );
        return item?.quantity ?? 0;
    };

    // ------------------ INCREMENT ------------------
    const increment = async () => {
        if (!selectedItem) return;
        const productId = selectedItem._id;
        const listId = shoppingListState.activeList?._id;
        if (!listId) return;

        try {
            await addItemToBackend({ listId, productId }).unwrap();
            dispatch(addItemLocal({ productId }));
        } catch (e) {
            console.error("Increment failed:", e);
        }
    };

    // ------------------ DECREMENT ------------------
    const decrement = async () => {
        if (!selectedItem) return;
        const productId = selectedItem._id;
        const listId = shoppingListState.activeList?._id;
        if (!listId) return;


        try {
            await removeItemFromBackend({ listId, productId }).unwrap();
            dispatch(removeItemLocal(productId));
        } catch (e) {
            console.error("Decrement failed:", e);
        }
    };

    // ------------------ UI ------------------
    return (
        <SafeAreaView style={styles.container}>
            <SearchHeader
                placeholder="Search items..."
                backRoute="/main/additem/additem"
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
                                source={{ uri: item.image }}
                                style={styles.itemImage}
                            />
                            <ItimText size={16} color="#000" weight="bold">
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

    if (!listItem) return;

    const itemId = listItem._id._id;
    const newQty = listItem.quantity - 1;

    try {
      await removeItemFromBackend({ listId, itemId }).unwrap();

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
                source={{ uri: item.image }}
                style={styles.itemImage}
              />

              <ItimText size={16} color="#000" weight="bold">
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
    itemImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 8,
    },
});
