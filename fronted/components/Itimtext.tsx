import React from "react";
import { Text, TextProps, StyleSheet, TextStyle } from "react-native";

type Props = TextProps & {
  size?: number;
  color?: string;
  weight?: TextStyle["fontWeight"];
};

export default function ItimText({
  children,
  size = 16,
  color = "#000",
  weight = "normal",
  style,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[styles.base, { fontSize: size, color, fontWeight: weight }, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  // שם הפונט כפי שמוטען מה-hook
  base: { fontFamily: "Itim_400Regular" },
});
