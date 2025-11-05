import React from "react";
import { Text, TextProps, StyleSheet, TextStyle } from "react-native";

type Props = TextProps & {
  size?: number;
  color?: string;
  weight?: TextStyle["fontWeight"];
  family?: string
};

export default function ItimText({
  children,
  size = 16,
  color = "#000",
  weight = "normal",
  family = "",
  style,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[styles.base, { fontSize: size, color, fontWeight: weight, fontFamily: family  }, style]}
    >
      {children}
    </Text>
  );
}
const styles = StyleSheet.create({
 //font name
  base: { fontFamily: "Itim_400Regular" },
});
