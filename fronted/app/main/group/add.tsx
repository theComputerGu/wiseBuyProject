import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Logo from "../../../components/Logo";
import TextField from "../../../components/TextField";
import Button from "../../../components/Button";

export default function AddMembers() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();

  const [email, setEmail] = useState("");
  const [members, setMembers] = useState<string[]>([
    "user1@example.com",
    "user2@example.com",
    "user3@example.com",
  ]);

  const addEmail = () => {
    const e = email.trim();
    if (!e) return;
    if (!/^\S+@\S+\.\S+$/.test(e)) return;
    if (members.includes(e)) return;

    setMembers((m) => [...m, e]);
    setEmail("");
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAwareScrollView
        contentContainerStyle={s.page}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <Ionicons
          name="arrow-back"
          size={22}
          onPress={() => router.replace("/main/group/create")}
          style={s.back}
        />

        <Logo sizeMultiplier={0.55} textScale={0.18} />

        <Text style={s.title}>Add Members</Text>
        {name ? <Text style={s.sub}>Group: {name}</Text> : null}

        <Text style={s.label}>Email</Text>

        <TextField
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View style={s.buttonWrap}>
          <Button title="Add" onPress={addEmail} />
        </View>

        <View style={s.listWrap}>
          <FlatList
            data={members}
            keyExtractor={(x) => x}
            scrollEnabled={false} // important inside KeyboardAwareScrollView
            renderItem={({ item }) => (
              <Text style={s.item}>{item}</Text>
            )}
            contentContainerStyle={{ gap: 6 }}
            ListEmptyComponent={
              <Text style={s.empty}>No members yet.</Text>
            }
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  page: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 60,
    gap: 10,
  },
  back: {
    position: "absolute",
    top: 10,
    left: 12,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
  },
  sub: {
    color: "#6B7280",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#111",
    marginTop: 8,
    marginBottom: 4,
  },
  buttonWrap: {
    marginTop: 4,
  },
  listWrap: {
    marginTop: 12,
  },
  item: {
    fontSize: 16,
    color: "#111",
    paddingVertical: 4,
  },
  empty: {
    color: "#6B7280",
  },
});
