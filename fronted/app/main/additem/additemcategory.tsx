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

    const { data: products = [], isLoading } = useGetProductsQuery({
        category: name,
    });

    const [addItemToBackend] = useAddItemMutation();
    const [removeItemFromBackend] = useRemoveItemMutation();

    const [selectedItem, setSelectedItem] = useState<any>(null);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;

    // ... (openPopup and closePopup functions remain the same) ...
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

    //
    // GET QUANTITY (FROM REDUX STATE)
    // FIX applied based on the previous discussion (assuming i.productId._id structure)
    //
    
    const getCurrentQty = (productId: string): number => {
        const item = shoppingListState.activeList?.items?.findIndex(
          (i: any) => i._id?._id?.toString() === productId.toString()
        );

        // LOGGING STEP 1: Check what getCurrentQty is finding
        console.log(`[getCurrentQty] shopping list ${shoppingListState.activeList.items[0]._id._id}`);
        console.log(`[getCurrentQty] Found List Item: ${JSON.stringify(item)}`);
        console.log(`[getCurrentQty] Returning Quantity: ${item?.quantity || 0}`);

        return shoppingListState.activeList.items[item]?.quantity || 0;
    };


    //
    // INCREMENT (backend first → redux second with calculated quantity)
    //
    const increment = async () => {
        if (!selectedItem) return;

        const productId = selectedItem._id;
        const listId = shoppingListState.activeList?._id;

        if (!listId) {
            console.log("[INCREMENT] No active list ID found.");
            return;
        }

        // 1. Calculate the expected new quantity from the current local state
        const currentQty = getCurrentQty(productId);
        const newQty = currentQty + 1;

        // LOGGING STEP 2: Before API call
        console.log(`[INCREMENT] Starting API call.`);
        console.log(`[INCREMENT] Product ID: ${productId}, List ID: ${listId}`);
        console.log(`[INCREMENT] Current Qty (local): ${currentQty}, Expected New Qty: ${newQty}`);

        try {
            // 2. Call the backend API
            await addItemToBackend({ listId, productId }).unwrap();
            console.log("[INCREMENT] Backend add successful. Updating Redux.");

            // 3. Update Redux based on the expected new quantity
            if (newQty > 1) {
                dispatch(
                    updateItem({
                        productId,
                        patch: { quantity: newQty },
                    })
                );
            } else {
                dispatch(
                    addItemLocal({
                        _id: selectedItem, // NOTE: Assuming addItemLocal expects the full product object here
                        quantity: 1,
                    })
                );
            }
            console.log(`[INCREMENT] Redux updated to Qty: ${newQty}`);
        } catch (error) {
            console.error("Failed to increment item:", error);
        }
    };

    //
    // DECREMENT (backend first → redux second with calculated quantity)
    //
    const decrement = async () => {
        if (!selectedItem) return;

        const productId = selectedItem._id;
        const listId = shoppingListState.activeList?._id;

        if (!listId) {
            console.log("[DECREMENT] No active list ID found.");
            return;
        }

        // 1. Calculate the expected new quantity from the current local state
        const currentQty = getCurrentQty(productId);
        if (currentQty <= 0) {
            console.log("[DECREMENT] Current quantity is 0 or less. Stopping.");
            return;
        }

        const newQty = currentQty - 1;

        // LOGGING STEP 3: Before API call
        console.log(`[DECREMENT] Starting API call.`);
        console.log(`[DECREMENT] Product ID: ${productId}, List ID: ${listId}`);
        console.log(`[DECREMENT] Current Qty (local): ${currentQty}, Expected New Qty: ${newQty}`);

        try {
            // 2. Call the backend API
            // The 404 error you are seeing happens HERE
            await removeItemFromBackend({ listId, productId }).unwrap();
            console.log("[DECREMENT] Backend removal/decrement successful. Updating Redux.");

            // 3. Update Redux based on the successful API call
            if (newQty === 0) {
                // Quantity reached zero, remove the item entirely from the list
                dispatch(removeItemLocal(productId));
            } else {
                // Quantity is > 0, update the item's quantity
                dispatch(
                    updateItem({
                        productId,
                        patch: { quantity: newQty },
                    })
                );
            }
            console.log(`[DECREMENT] Redux updated to Qty: ${newQty}`);
        } catch (error) {
            // LOGGING STEP 4: Capture the API error
            console.error("Failed to decrement item (API Error):", error);
            // This is critical: if the API fails, the local state (qty) MUST NOT be updated.
            console.log(`[DECREMENT] API failed. Local quantity remains ${currentQty}.`);
        }
    };

    // ... (rest of the component and styles remain the same) ...
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

            {/* POPUP */}
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