import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from './Itimtext';

// ✅ Import proper type for icon names
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface TitleProps {
  text: string;
  icon?: IconName;
  onPress?: () => void;
  color?: string;
  size?: number;
  weight?: 'regular' | 'bold';
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
}

export default function Title({
  text,
  icon,
  onPress,
  color = '#197FF4',
  size = 20,
  weight = 'bold',
  align = 'left',
  fontFamily,
}: TitleProps) {
  

  return (
    <View
      style={[
        styles.row,
        { justifyContent: align === 'center' ? 'center' : 'flex-start' },
      ]}
    >
      {icon && (
        <Pressable onPress={onPress} style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={size * 0.9} color={color} />
        </Pressable>
      )}
      <ItimText size={size} color={color} weight={weight} fontFamily={fontFamily} style={styles.text}>
        {text}
      </ItimText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 5,
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    includeFontPadding: false,
  },
});
