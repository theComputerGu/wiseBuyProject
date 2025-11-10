// app/group/join.tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import Logo from "../../../components/Logo";
import TextField from "../../../components/TextField";
import Button from "../../../components/Button";
import { API_URL } from '@env';

const BRAND = "#197FF4";

export default function JoinGroup() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const onJoin = () => {
    const trimmed = code.trim();
    if (!trimmed) return Alert.alert("Missing code", "Please enter a group code.");
    // TODO: חיבור ל־API בעתיד
    router.replace("/group");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={s.container}>
        {/* back arrow */}
        <Ionicons name="arrow-back" size={22} color="#111" onPress={() => router.back()} style={s.back} />

        {/* logo + brand */}
        <Logo sizeMultiplier={0.6} textScale={0.18} />

        {/* title */}
        <Text style={s.title}>Join Group</Text>

        {/* input */}
        <TextField
          placeholder="Group code"
          value={code}
          onChangeText={setCode}
        />

        {/* action */}
        <Button title="Join Group" onPress={onJoin} />

        {/* subtle bottom divider like mock */}
        <View style={s.bottomDivider} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  back: {
    position: "absolute",
    top: 10,
    left: 12,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    marginTop: 4,
    marginBottom: 6,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 16,
  },
});
