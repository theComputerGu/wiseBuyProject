import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useFonts, Itim_400Regular } from '@expo-google-fonts/itim';

interface FontTextProps extends TextProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: 'regular' | 'bold';
}

export default function FontText({
  children,
  size = 16,
  color = '#000',
  weight = 'regular',
  style,
  ...props
}: FontTextProps) {
  const [fontsLoaded] = useFonts({
    Itim_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <Text
      {...props}
      style={[
        styles.text,
        { fontSize: size, color },
        weight === 'bold' && styles.bold,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Itim_400Regular',
  },
  bold: {
    fontWeight: '700',
  },
});