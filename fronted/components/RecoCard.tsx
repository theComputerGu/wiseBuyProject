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
            {/* FLOATING ADD BUTTON – TOP RIGHT OF CARD */}
            <Pressable style={s.addBtn} onPress={onAdd}>
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            </Pressable>

            {/* CONTENT */}
            <View style={s.content}>
                {/* IMAGE (LEFT) */}
                <Image source={image} style={s.img} />

                {/* TEXT (RIGHT, RTL ALIGNED) */}
                <View style={s.textWrapper}>
                    <ItimText size={14} weight="bold" style={s.rtlText}>
                        {title}
                    </ItimText>

                    {price && (
                        <ItimText size={13} color="#555" style={s.rtlText}>
                            {price}
                        </ItimText>
                    )}

                    {reason && (
                        <ItimText size={12} color="#777" style={s.reasonText}>
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
        position: "relative",
        width: 260,
        height: 110,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 8,
        marginRight: 12,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    /* + BUTTON */
    addBtn: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: BRAND,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
        zIndex: 10,
    },

    /* CONTENT ROW */
    content: {
        flexDirection: "row",
        flex: 1,
        marginTop: 8, // space under +
    },

    /* IMAGE */
    img: {
        width: "40%",
        height: "100%",
        resizeMode: "contain",
        borderRadius: 10,
    },

    /* TEXT */
    textWrapper: {
        flex: 1,
        paddingLeft: 10,
        justifyContent: "center",
    },

    rtlText: {
        textAlign: "right",
        writingDirection: "rtl",
    },

    reasonText: {
        textAlign: "right",
        writingDirection: "rtl",
        marginTop: 4,
        fontStyle: "italic",
    },
});

export default memo(RecoCard);
