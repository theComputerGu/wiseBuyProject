import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import ItimText from './Itimtext';

interface CategoryCardProps {
  name: string;
  image: any;
  onPress?: () => void;
}

export default function CategoryCard({ name, image, onPress }: CategoryCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={image} style={styles.image} />

      <ItimText
        size={16}
        color="#000"
        style={styles.title}   // ⬅️ חשוב
        numberOfLines={2}
      >
        {name}
      </ItimText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',   // האייקון נשאר במרכז
    marginBottom: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  image: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },

  title: {
  width: '100%',
  textAlign: 'center',       // ⬅️ מרכז
  writingDirection: 'rtl',   // ⬅️ עברית
  paddingHorizontal: 8,
  lineHeight: 20,
},
});
