import React from 'react';
import { Image, StyleSheet, Pressable } from 'react-native';
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
        size={13}
        color="#1a1a1a"
        weight="600"
        style={styles.title}
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 18,
  },
});
