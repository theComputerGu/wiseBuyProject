import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>WiseBuy</Text>
      <Link href="/sign-in" style={s.btn}>Sign In</Link>
      <Link href="/sign-up" style={[s.btn, s.secondary]}>Sign Up</Link>
    </View>
  );
}
const s = StyleSheet.create({
  wrap:{ flex:1, justifyContent:"center", alignItems:"center", gap:12, padding:24, backgroundColor:"#E5E7EB" },
  title:{ fontSize:28, fontWeight:"800", marginBottom:8 },
  btn:{ width:220, textAlign:"center", paddingVertical:14, borderRadius:12, backgroundColor:"#2563EB", color:"#fff", fontWeight:"700" },
  secondary:{ backgroundColor:"#1F2937" }
});
