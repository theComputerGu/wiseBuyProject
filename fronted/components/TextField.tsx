import { View, TextInput, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function TextField({
  value, onChangeText, placeholder, secure, keyboardType="default", style, inputStyle
}:{
  value: string; onChangeText:(t:string)=>void; placeholder:string; secure?:boolean; keyboardType?: any; style?: StyleProp<ViewStyle>; inputStyle?: StyleProp<TextStyle>;
}) {
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={[st.wrap, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="none"
        keyboardType={keyboardType}
        secureTextEntry={hidden}
        style={[st.input, inputStyle]}
      />
      {secure ? (
        <Ionicons name={hidden ? "eye" : "eye-off"} size={20} onPress={()=>setHidden(!hidden)} />
      ) : null}
    </View>
  );
}
const st = StyleSheet.create({
  wrap:{ flexDirection:"row", alignItems:"center", gap:10, borderWidth:1, borderColor:"#D1D5DB", borderRadius:12, paddingHorizontal:12 },
  input:{ flex:1, paddingVertical:12, fontSize:16 }
});