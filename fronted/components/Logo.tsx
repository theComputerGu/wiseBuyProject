import React from "react";
import { View, Image, Text, StyleSheet, useWindowDimensions, StyleProp, ViewStyle, TextStyle, ImageStyle } from "react-native";

type Props = {

  size?: number;

  sizeMultiplier?: number;
  /** יחס לגודל האייקון עבור כיתוב (ברירת מחדל 0.35 => 35% מהאייקון) */
  textScale?: number;
  /** צבע הטקסט של Wise/Buy */
  textColor?: string;
  /** אפשרות להעביר סטיילים חיצוניים */
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function Logo({
  size,
  sizeMultiplier = 0.25,
  textScale = 0.35,
  textColor = "#2563EB",
  containerStyle,
  imageStyle,
  textStyle,
}: Props) {
  const { width } = useWindowDimensions();
  const iconSize = size ?? width * sizeMultiplier;

  return (
    <View style={[{ alignItems: "center", gap: 6 }, containerStyle]}>
      <Image
        source={require("../assets/logo black.png")}  // שים לב: עדיף לשנות ל 'logo-black.png' בעתיד
        style={[{ width: iconSize, height: iconSize, resizeMode: "contain" }, imageStyle]}
      />
      <Text style={[styles.brand, { fontSize: iconSize * textScale }, textStyle]}>
        <Text style={{ color: textColor }}>Wise</Text>
        <Text style={{ color: textColor }}>Buy</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
