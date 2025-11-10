import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import Logo from "../../../components/Logo";
import TextField from "../../../components/TextField";
import Button from "../../../components/Button";
import { API_URL } from '@env';

export default function CreateGroup() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");

  const onCreateGroup = () => {
    const name = groupName.trim();
    if (!name) return Alert.alert("Missing name", "Please enter a group name.");
    // דמו: "יצירת" קבוצה והחזרה לדף הקבוצות
    Alert.alert("Group created", `“${name}” was created.`, [
      { text: "OK", onPress: () => router.replace("/group") },
    ]);
  };

  const goToAddMembers = () => {
    // מעבירים הלאה את השם (לא חובה כרגע)
    router.push({ pathname: "/group/create/add", params: { name: groupName } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={s.page}>
        <Ionicons name="arrow-back" size={22} onPress={() => router.back()} style={s.back} />
        <Logo sizeMultiplier={0.55} textScale={0.18} />

        <Text style={s.title}>Create Group</Text>

        <Text style={s.label}>Group Name</Text>
        <TextField
          placeholder="e.g. Family groceries"
          value={groupName}
          onChangeText={setGroupName}
        />

        <View style={{ gap: 10, marginTop: 6 }}>
          <Button title="Add Members" onPress={goToAddMembers} />
          <Button title="Create Group" onPress={onCreateGroup} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, justifyContent: "center", gap: 10 },
  back: { position: "absolute", top: 10, left: 12 },
  title: { fontSize: 28, fontWeight: "900", marginTop: 6, marginBottom: 8 },
  label: { fontSize: 14, color: "#111", marginTop: 4, marginBottom: 4 },
});
