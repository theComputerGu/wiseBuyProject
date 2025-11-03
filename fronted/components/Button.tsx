import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";

export default function Button({ title, onPress, style, disabled }:{
  title: string; onPress: () => void; style?: ViewStyle; disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({pressed}) => [styles.btn, style, pressed && {opacity:.9}, disabled && {opacity:.6}]}>
      <Text style={styles.txt}>{title}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  btn:{ backgroundColor:"#2563EB", paddingVertical:14, borderRadius:10, alignItems:"center" },
  txt:{ color:"#fff", fontWeight:"700", fontSize:16 }
});
