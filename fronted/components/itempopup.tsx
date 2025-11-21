import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    Pressable,
    TouchableWithoutFeedback,
    Animated,
    Image,
} from "react-native";
import ItimText from "./Itimtext";

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
        // FIX: Prevent press on the popup content from triggering onClose
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

                        {/* Image */}
                        <Image source={{ uri: item.image }} style={styles.popupImage} />

                        {/* Counter */}
                        <View style={styles.counterRow}>
                            <Pressable style={styles.qtyButtonSmall} onPress={handleDecrement}>
                                <ItimText size={22} color="#197FF4" weight="bold">-</ItimText>
                            </Pressable>

                            <ItimText
                                size={20}
                                color="#000"
                                weight="bold"
                                style={{ marginHorizontal: 15 }}
                            >
                                {qty}
                            </ItimText>

                            <Pressable style={styles.qtyButtonSmall} onPress={handleIncrement}>
                                <ItimText size={22} color="#197FF4" weight="bold">+</ItimText>
                            </Pressable>
                        </View>

                        {/* Info */}
                        <ItimText size={20} color="#000" weight="bold">
                            {item.title}
                        </ItimText>

                        <ItimText size={18} color="#197FF4">
                            {item.pricerange ?? ""}
                        </ItimText>

                        <ItimText size={14} color="#555">
                            {item.unit ?? ""}
                        </ItimText>

                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    popupCard: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: "center",
    },
    handleBar: {
        width: 50,
        height: 5,
        backgroundColor: "#ccc",
        borderRadius: 2.5,
        marginBottom: 10,
    },
    popupImage: {
        width: 120,
        height: 120,
        resizeMode: "contain",
        marginBottom: 8,
    },
    counterRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 10,
    },
    qtyButtonSmall: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#E8F1FF",
        justifyContent: "center",
        alignItems: "center",
    },
});