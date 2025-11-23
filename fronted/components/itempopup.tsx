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
    getCurrentQty: (productId: string) => number;
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
    const [qty, setQty] = useState(0);

    useEffect(() => {
        if (item && visible) {
            const q = getCurrentQty(item._id);
            setQty(q);
        } else {
            setQty(0);
        }
    }, [item, visible]);

    const handleIncrement = () => {
        onIncrement();
        setQty(q => q + 1);
    };

    const handleDecrement = () => {
        if (qty > 0) {
            onDecrement();
            setQty(q => q - 1);
        }
    };

    if (!visible || !item) return null;

    return (
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <Animated.View style={[styles.popupCard, { transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.handleBar} />
                        <Image source={{ uri: item.image }} style={styles.popupImage} />

                        <View style={styles.counterRow}>
                            <Pressable style={styles.qtyButtonSmall} onPress={handleDecrement}>
                                <ItimText size={22} color="#197FF4" weight="bold">-</ItimText>
                            </Pressable>

                            <ItimText size={20} color="#000" weight="bold" style={{ marginHorizontal: 15 }}>
                                {qty}
                            </ItimText>

                            <Pressable style={styles.qtyButtonSmall} onPress={handleIncrement}>
                                <ItimText size={22} color="#197FF4" weight="bold">+</ItimText>
                            </Pressable>
                        </View>

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
