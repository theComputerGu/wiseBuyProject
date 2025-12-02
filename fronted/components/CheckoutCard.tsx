import React, { useState } from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import ItimText from "./Itimtext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
    name: string;
    price: string;
    quantity: number;
    image: any;
};

export default function CheckoutCard({ name, price, quantity, image }: Props) {
    const [checked, setChecked] = useState(false);

    const priceNumber = parseFloat(price.replace(/[^\d.]/g, "")) || 0;
    const total = (priceNumber * quantity).toFixed(2);

    return (
        <View style={styles.card}>
            {/* ONLY ADD IF YOU WANT AN OPTION TO TRACK HOW MANY ITEMS YOU HAVE
            Checkbox
            <Pressable onPress={() => setChecked(!checked)} style={styles.checkbox}>
                <MaterialCommunityIcons
                    name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={28}
                    color={checked ? "#197FF4" : "#aaa"}
                />
            </Pressable>
            */}

            {/* Image */}
            <Image source={image} style={styles.img} />

            {/* Text Info */}
            <View style={styles.text}>
                <ItimText size={16} weight="bold">
                    {name}
                </ItimText>

                <ItimText size={14} color="#555" style={{ marginTop: 2 }}>
                    {price} × {quantity}
                </ItimText>

                <ItimText size={16} weight="bold" style={{ marginTop: 4, color: "#197FF4" }}>
                    ₪{total}
                </ItimText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 14,
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    checkbox: {
        marginRight: 10,
    },

    img: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: "#f2f2f2",
    },

    text: {
        flex: 1,
    },
});
