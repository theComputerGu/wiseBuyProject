import React, { memo } from "react";
import { View, Image, StyleSheet, Pressable, ImageSourcePropType } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ItimText from "./Itimtext";

type Props = {
  id?: number | string;
  name: string;
  price: string;
  image: ImageSourcePropType;
  quantity: number;
  averageLabel?: string;
  onIncrease?: () => void;
  onDecrease?: () => void;
  uploaderAvatar?: ImageSourcePropType;
  uploaderName?: string;
};

const BRAND = "#197FF4";

function ProductCard({
  name,
  price,
  image,
  quantity,
  averageLabel,
  onIncrease,
  onDecrease,
  uploaderAvatar,
  uploaderName,
}: Props) {

  return (
    <View style={s.card}>
      <Image source={image} style={s.img} />

      <View style={s.info}>
        {/* --- Header row --- */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            {/* 🔥 הופך תמיד למחרוזת */}
            <ItimText size={16} color="#000" weight="bold">
              {String(name)}
            </ItimText>

            {/* 🔥 לעולם לא יחזיר undefined / null */}
            <ItimText size={14} color="#555">
              {String(`${price}${averageLabel ? ` (${averageLabel})` : ""}`)}
            </ItimText>
          </View>

          {/* Avatar בצד ימין */}
          {uploaderAvatar && <Image source={uploaderAvatar} style={s.avatar} />}
        </View>

        {/* --- Quantity controls --- */}
        <View style={s.row}>
          <Pressable style={s.btn} onPress={onDecrease} hitSlop={8}>
            <MaterialCommunityIcons name="minus" size={18} color={BRAND} />
          </Pressable>

          <View style={s.qty}>
            {/* 🔥 לעולם לא נשבר - הכמות תמיד string */}
            <ItimText size={16} color={BRAND} weight="bold">
              {String(quantity)}
            </ItimText>
          </View>

          <Pressable style={s.btn} onPress={onIncrease} hitSlop={8}>
            <MaterialCommunityIcons name="plus" size={18} color={BRAND} />
          </Pressable>
        </View>

        {uploaderName && (
          <ItimText size={12} color="#777" style={{ marginTop: 4 }}>
            {String(`Added by: ${uploaderName}`)}
          </ItimText>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    padding: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  img: { width: 64, height: 92, resizeMode: "contain", borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 26,
    height: 50,
    borderRadius: 13,
    marginLeft: 8,
    alignSelf: "center",
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 },
  btn: {
    borderWidth: 1,
    borderColor: BRAND,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qty: {
    borderWidth: 1,
    borderColor: BRAND,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: "center",
  },
});

export default memo(ProductCard);
