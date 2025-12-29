import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    Pressable,
    TouchableWithoutFeedback,
    Animated,
    Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ItimText from "./Itimtext";
import { API_URL } from "@env";

const BRAND = "#197FF4";

interface ItemPopupProps {
    visible: boolean;
    item: any | null;
    slideAnim: Animated.Value;
    onClose: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
    getCurrentQty: (productId: any) => number;
}

export default function ItemPopup({
    visible,
    item,
    slideAnim,
    onClose,
    onIncrement,
    onDecrement,
    getCurrentQty,
}: ItemPopupProps) {
    const [qty, setQty] = useState<number>(0);

    // Load item qty ONLY when popup opens
    useEffect(() => {
        if (!item || !visible) {
            // Reset quantity when the popup is closed
            setQty(0);
            return;
        }

        // FIX: The function is now synchronous, so no need for async/await or isMounted.
        // It should also use item._id since that is the product ID passed by AddItemCategoryScreen
        // as the unique identifier for the product.
        const productId = item._id; // Ensure you use the correct product ID property
        const localQty = getCurrentQty(productId);

        // Directly set the quantity from the synchronous function
        setQty(localQty);

    }, [item, visible, getCurrentQty]); // Added visible and getCurrentQty as dependencies

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

    // Update local visual qty immediately
    const handleIncrement = () => {
        setQty((q) => q + 1);
        onIncrement();
    };

    const handleDecrement = () => {
        setQty((q) => Math.max(0, q - 1));
        onDecrement();
    };

    if (!visible || !item) return null;

    return (
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <Animated.View
                        style={[
                            styles.popupCard,
                            { transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        {/* Handle bar */}
                        <View style={styles.handleBar} />

                        {/* Close button */}
                        <Pressable style={styles.closeBtn} onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={20} color="#71717a" />
                        </Pressable>

                        {/* Image Container */}
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: fixImageURL(item.image) }} style={styles.popupImage} />
                        </View>

                        {/* Product Info */}
                        <View style={styles.infoSection}>
                            <ItimText size={18} color="#1a1a1a" weight="bold" style={styles.rtlText} numberOfLines={2}>
                                {item.title}
                            </ItimText>

                            <View style={styles.priceRow}>
                                <ItimText size={20} color={BRAND} weight="bold">
                                    {item.pricerange ?? ""}
                                </ItimText>
                                {item.unit && (
                                    <ItimText size={13} color="#9ca3af" style={{ marginLeft: 8 }}>
                                        {item.unit}
                                    </ItimText>
                                )}
                            </View>
                        </View>

                        {/* Quantity Section */}
                        <View style={styles.quantitySection}>
                            <ItimText size={14} color="#71717a" style={{ marginBottom: 10 }}>
                                Quantity
                            </ItimText>
                            <View style={styles.counterRow}>
                                <Pressable
                                    style={[styles.qtyButton, qty === 0 && styles.qtyButtonDisabled]}
                                    onPress={handleDecrement}
                                    disabled={qty === 0}
                                >
                                    <MaterialCommunityIcons
                                        name="minus"
                                        size={22}
                                        color={qty === 0 ? "#d1d5db" : BRAND}
                                    />
                                </Pressable>

                                <View style={styles.qtyDisplay}>
                                    <ItimText size={24} color="#1a1a1a" weight="bold">
                                        {qty}
                                    </ItimText>
                                </View>

                                <Pressable style={styles.qtyButton} onPress={handleIncrement}>
                                    <MaterialCommunityIcons name="plus" size={22} color={BRAND} />
                                </Pressable>
                            </View>
                        </View>

                        {/* Done Button */}
                        <Pressable style={styles.doneBtn} onPress={onClose}>
                            <MaterialCommunityIcons name="check" size={20} color="#fff" />
                            <ItimText size={16} color="#fff" weight="600" style={{ marginLeft: 8 }}>
                                {qty > 0 ? "עדכן סל" : "סגור"}
                            </ItimText>
                        </Pressable>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    popupCard: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 30,
        alignItems: "center",
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: "#e5e7eb",
        borderRadius: 2,
        marginBottom: 16,
    },
    closeBtn: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f4f4f5",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    imageContainer: {
        width: 140,
        height: 140,
        borderRadius: 16,
        backgroundColor: "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    popupImage: {
        width: 110,
        height: 110,
        resizeMode: "contain",
    },
    infoSection: {
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
    },
    rtlText: {
        textAlign: "center",
        writingDirection: "rtl",
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    quantitySection: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#f4f4f5",
        marginBottom: 16,
    },
    counterRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    qtyButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    qtyButtonDisabled: {
        backgroundColor: "#f9fafb",
        borderColor: "#f4f4f5",
    },
    qtyDisplay: {
        width: 70,
        alignItems: "center",
    },
    doneBtn: {
        flexDirection: "row",
        width: "100%",
        backgroundColor: BRAND,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
});