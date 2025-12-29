import React, { memo } from "react";
import {
    View,
    Image,
    StyleSheet,
    Pressable,
    ImageSourcePropType,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ItimText from "./Itimtext";

type Props = {
    title: string;
    price?: string;
    image: ImageSourcePropType;
    reason?: string;
    onAdd: () => void;
};

const BRAND = "#197FF4";

function RecoCard({ title, price, image, reason, onAdd }: Props) {
    return (
        <View style={s.card}>
            {/* Product Image */}
            <Image source={image} style={s.img} />

            {/* Right Section - Button on top, text below */}
            <View style={s.rightSection}>
                {/* Add Button - Top Right */}
                <Pressable style={s.addBtn} onPress={onAdd} hitSlop={8}>
                    <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                </Pressable>

                {/* Text Content - Below button */}
                <View style={s.textContent}>
                    <ItimText size={14} color="#1a1a1a" weight="600" style={s.rtlText} numberOfLines={2} ellipsizeMode="tail">
                        {title}
                    </ItimText>

                    {price && (
                        <ItimText size={15} color={BRAND} weight="bold" style={[s.rtlText, { marginTop: 4 }]}>
                            {price}
                        </ItimText>
                    )}

                    {reason && (
                        <ItimText size={11} color="#9ca3af" style={[s.rtlText, { marginTop: 4 }]} numberOfLines={1} ellipsizeMode="tail">
                            {reason}
                        </ItimText>
                    )}
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        flexDirection: "row",
        width: 260,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        padding: 12,
        marginRight: 12,
        alignItems: "stretch",
    },
    img: {
        width: 70,
        height: "100%",
        borderRadius: 12,
        resizeMode: "contain",
    },
    rightSection: {
        flex: 1,
        marginLeft: 12,
        alignItems: "flex-end",
    },
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: BRAND,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        marginBottom: 6,
    },
    textContent: {
        width: "100%",
    },
    rtlText: {
        textAlign: "right",
        writingDirection: "rtl",
    },
});

export default memo(RecoCard);
