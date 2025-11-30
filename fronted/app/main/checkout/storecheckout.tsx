import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ItimText from "../../../components/Itimtext";
import Button from "../../../components/Button";
import BottomNav from "../../../components/Bottomnavigation";
import { useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";
import { API_URL } from "@env";
import ProductCard from "../../../components/productcard";


export default function StoreCheckoutScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const storeName = "שופרסל דיל";
    const dispatch = useDispatch();

    const shoppingList = useSelector((s: RootState) => s.shoppingList);
    const items = shoppingList.activeList?.items ?? [];

    // 🔹 חישוב סכום כולל
    const totalPrice = items.reduce((sum, item: any) => {
        const price = parseFloat(
            item._id.pricerange?.replace(/[^\d.]/g, "") || "0"
        );
        return sum + price * item.quantity;
    }, 0);

    // Change 127.0.0.1 to your computer LAN IP
    const fixImageURL = (url: any) => {
        if (!url) return "";

        try {
            const original = new URL(url);
            const backend = new URL(API_URL);

            // Replace only host + port
            original.host = backend.host;

            return original.toString();
        } catch (e) {
            return url; // fallback
        }
    };

    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.container}>

                {/* ---------- TOP BAR ---------- */}
                <View style={styles.topBar}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color="#197FF4" />
                    </Pressable>

                    <ItimText size={22} weight="bold" style={styles.storeTitle}>
                        {storeName}
                    </ItimText>

                    <View style={{ width: 26 }} /> {/* placeholder for alignment */}
                </View>

                {/* ---------- ITEM LIST ---------- */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {items.length === 0 ? (
                        <ItimText size={14} color="#777" style={{ textAlign: "center", marginTop: 20 }}>
                            No items in your shopping list yet.
                        </ItimText>
                    ) : (
                        items.map((item: any) => (
                            <ProductCard
                                key={item._id._id}
                                name={item._id.title}
                                quantity={item.quantity}
                                price={item._id.pricerange}
                                image={{ uri: fixImageURL(item._id.image) }}

                            />
                        ))
                    )}
                </ScrollView>

                {/* ---------- CHECKOUT BUTTON ---------- */}
                <Button title={`Confirm Purchase • ₪${totalPrice}`} onPress={() => { }} />

                <BottomNav />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff",
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
    },

    /* TOP BAR */
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        marginTop: 5,
    },

    backButton: {
        padding: 5,
    },
    scrollContent: { paddingBottom: 0 },

    storeTitle: {
        flex: 1,
        textAlign: "center",
    },

    /* ITEMS */
    itemCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    itemRight: {
        flexDirection: "row",
        alignItems: "center",
    },
});
