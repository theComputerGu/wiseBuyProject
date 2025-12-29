import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNav from "../../../components/Bottomnavigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";
import { useGetHistoryByIdQuery, useRestorePurchaseMutation } from "../../../redux/svc/groupsApi";
import { setActiveList } from "../../../redux/slices/shoppinglistSlice";
import CheckoutCard from "../../../components/CheckoutCard";
import { API_URL } from "@env";
import ItimText from "../../../components/Itimtext";
import Title from "../../../components/Title";

const BRAND = "#197FF4";

export default function HistoryItems() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const dispatch = useDispatch();
    const activeGroup = useSelector((s: RootState) => s.group.activeGroup);
    const activeList = useSelector((s: RootState) => s.shoppingList.activeList);
    const [restorePurchase] = useRestorePurchaseMutation();

    const { data, isLoading } = useGetHistoryByIdQuery({
        groupId: activeGroup?._id!,
        historyId: id as string,
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
                            router.replace('/main/product');
                        } catch (err) {
                            console.error("Restore error:", err);
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={BRAND} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.center}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#d1d5db" />
                    <ItimText size={16} color="#71717a" style={{ marginTop: 12 }}>
                        History data not found.
                    </ItimText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <Pressable style={styles.backBtn} onPress={() => router.replace('/main/history/history')}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={BRAND} />
                    </Pressable>
                    <Title text="Purchase Details" color={BRAND} />
                    <View style={{ width: 40 }} />
                </View>

                {/* Item List */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {data.items.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="cart-off" size={60} color="#d1d5db" />
                            <ItimText size={16} color="#71717a" style={{ marginTop: 12, textAlign: "center" }}>
                                No items in this purchase.
                            </ItimText>
                        </View>
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
                    <MaterialCommunityIcons name="cart-plus" size={20} color="#fff" />
                    <ItimText size={16} color="#fff" weight="600" style={{ marginLeft: 8 }}>
                        Add All Items to Shopping List
                    </ItimText>
                </Pressable>

                <BottomNav />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    addAllBtn: {
        flexDirection: "row",
        backgroundColor: BRAND,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
