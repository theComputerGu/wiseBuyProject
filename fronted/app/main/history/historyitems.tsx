import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../../components/Bottomnavigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";
import { useGetHistoryByIdQuery, useRestorePurchaseMutation } from "../../../redux/svc/groupsApi";
import { useAddItemMutation } from "../../../redux/svc/shoppinglistApi";
import { setActiveList } from "../../../redux/slices/shoppinglistSlice";
import CheckoutCard from "../../../components/CheckoutCard";
import { API_URL } from "@env";
import ItimText from "../../../components/Itimtext";

const BRAND = "#197FF4";

export default function HistoryItems() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // historyId from navigation

    const dispatch = useDispatch();
    const activeGroup = useSelector((s: RootState) => s.group.activeGroup);
    const activeList = useSelector((s: RootState) => s.shoppingList.activeList);
    const [restorePurchase] = useRestorePurchaseMutation();

    // Fetch this history purchase
    const { data, isLoading } = useGetHistoryByIdQuery({
        groupId: activeGroup?._id!,
        historyId: id as string,
    });

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



    const handleAddAll = async () => {

        Alert.alert(
            "Are you sure?",
            "This action will change shopping list",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        if (!activeList || !activeGroup) return;

                        try {
                            const updatedList = await restorePurchase({
                                groupId: activeGroup._id,
                                shoppingListId: id as string,
                            }).unwrap();

                            dispatch(setActiveList(updatedList));

                            router.replace('/main/product')

                        } catch (err) {
                            console.error("Restore error:", err);
                        }
                    },
                },
            ]
        );


    }



    if (isLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={BRAND} />
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={{ fontSize: 16, color: "#555" }}>History data not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.container}>

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <Ionicons
                        name="arrow-back"
                        size={26}
                        color={BRAND}
                        onPress={() => router.replace('/main/history/history')}
                    />
                    <Text style={styles.title}>Purchase Details</Text>
                    <View style={{ width: 26 }} />
                </View>

                {/* ---------- ITEM LIST ---------- */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {data.items.length === 0 ? (
                        <ItimText size={14} color="#777" style={{ textAlign: "center", marginTop: 20 }}>
                            No items in your shopping list yet.
                        </ItimText>
                    ) : (
                        data.items.map((item: any) => (
                            <CheckoutCard
                                key={item._id._id}
                                name={item._id.title}
                                quantity={item.quantity}
                                price={item._id.pricerange}
                                image={{ uri: fixImageURL(item._id.image) }}
                            />
                        ))
                    )}
                </ScrollView>

                {/* Add all button */}
                <Pressable style={styles.addAllBtn} onPress={handleAddAll}>
                    <Text style={styles.addAllText}>Add All Items to Shopping List</Text>
                </Pressable>

                <BottomNav />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 12,
    },
    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },
    scrollContent: { paddingBottom: 0 },
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
    },
    qty: {
        fontSize: 14,
        color: "#555",
        marginTop: 4,
    },
    addAllBtn: {
        backgroundColor: BRAND,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 10,
    },
    addAllText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
