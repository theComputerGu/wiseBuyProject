import React from "react";
import { Text, TextProps, StyleSheet, TextStyle } from "react-native";

type Props = TextProps & {
  size?: number;
  color?: string;
  weight?: TextStyle["fontWeight"];
  fontFamily?: string;
};

export default function Itimtext({
  children,
  size = 16,
  color = "#000",
  weight = "normal",
  fontFamily,
  style,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { fontSize: size, color, fontWeight: weight, fontFamily },
        style,
      ]}
      numberOfLines={rest.numberOfLines}     // 👈 מאפשר קיצור טקסט
      ellipsizeMode={rest.ellipsizeMode}     // 👈 חיתוך "..."
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {},
});
