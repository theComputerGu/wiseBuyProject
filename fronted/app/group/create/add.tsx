import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Logo from "../../../components/Logo";
import TextField from "../../../components/TextField";
import Button from "../../../components/Button";
import { API_URL } from '@env';

export default function AddMembers() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();

  const [email, setEmail] = useState("");
  const [members, setMembers] = useState<string[]>([
    // דמו: אפשר להתחיל ריק [] אם מעדיפים
    "user1@example.com",
    "user2@example.com",
    "user3@example.com",
  ]);

  const addEmail = () => {
    const e = email.trim();
    if (!e) return;
    if (!/^\S+@\S+\.\S+$/.test(e)) return;        // ולידציית אימייל בסיסית
    if (members.includes(e)) return;               // מניעת כפילויות
    setMembers((m) => [...m, e]);
    setEmail("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={s.page}>
        <Ionicons name="arrow-back" size={22} onPress={() => router.back()} style={s.back} />
        <Logo sizeMultiplier={0.55} textScale={0.18} />

        <Text style={s.title}>Add Members</Text>
        {name ? <Text style={s.sub}>Group: {name}</Text> : null}

        <Text style={s.label}>Email</Text>
    

        <Button title="Add" onPress={addEmail} />

        <FlatList
          data={members}
          keyExtractor={(x) => x}
          renderItem={({ item }) => <Text style={s.item}>{item}</Text>}
          contentContainerStyle={{ paddingVertical: 8, gap: 6 }}
          ListEmptyComponent={<Text style={{ color: "#6B7280" }}>No members yet.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, justifyContent: "center", gap: 10 },
  back: { position: "absolute", top: 10, left: 12 },
  title: { fontSize: 28, fontWeight: "900", marginTop: 6 },
  sub: { color: "#6B7280", marginBottom: 6 },
  label: { fontSize: 14, color: "#111", marginTop: 8, marginBottom: 4 },
  item: { fontSize: 16, color: "#111", paddingVertical: 4 },
});
