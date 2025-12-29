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
  disabledDecrease?: boolean;
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
  disabledDecrease = false,
}: Props) {

  return (
    <View style={s.card}>
      {/* Product Image */}
      <Image source={image} style={s.img} />

      {/* Right Section - Title, Price & Controls */}
      <View style={s.rightSection}>
        {/* Title Row */}
        <View style={s.titleRow}>
          {uploaderAvatar && (
            <Image source={uploaderAvatar} style={s.avatar} />
          )}
          <View style={s.nameContainer}>
            <ItimText size={15} color="#1a1a1a" weight="600" style={s.rtlText} numberOfLines={2}>
              {String(name)}
            </ItimText>
            {uploaderName && (
              <View style={s.uploaderInfo}>
                <MaterialCommunityIcons name="account" size={12} color="#9ca3af" />
                <ItimText size={11} color="#9ca3af" style={{ marginLeft: 4 }}>
                  {String(uploaderName)}
                </ItimText>
              </View>
            )}
          </View>
        </View>

        {/* Price & Controls Row */}
        <View style={s.bottomRow}>
          <View style={s.priceContainer}>
            <ItimText size={16} color={BRAND} weight="bold">
              {String(price)}
            </ItimText>
            {averageLabel && (
              <View style={s.avgBadge}>
                <ItimText size={10} color="#71717a">
                  {averageLabel}
                </ItimText>
              </View>
            )}
          </View>

          <View style={s.quantityControls}>
            <Pressable
              style={[s.btn, disabledDecrease && s.btnDisabled]}
              onPress={disabledDecrease ? undefined : onDecrease}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="minus"
                size={18}
                color={disabledDecrease ? "#d1d5db" : BRAND}
              />
            </Pressable>

            <View style={s.qtyDisplay}>
              <ItimText size={16} color={BRAND} weight="bold">
                {String(quantity)}
              </ItimText>
            </View>

            <Pressable style={s.btn} onPress={onIncrease} hitSlop={8}>
              <MaterialCommunityIcons name="plus" size={18} color={BRAND} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
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
    marginVertical: 6,
    alignItems: "center",
  },
  img: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: "contain",
  },
  rightSection: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  nameContainer: {
    flex: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#eff6ff",
  },
  uploaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  avgBadge: {
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f5",
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  btnDisabled: {
    backgroundColor: "transparent",
  },
  qtyDisplay: {
    minWidth: 36,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});

export default memo(ProductCard);
