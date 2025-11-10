import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Logo from "../components/Logo";
import { API_URL } from '@env';
import { useLoginMutation } from "../app/src/svc/wisebuyApi";
import { useDispatch } from "react-redux";
import { setUser /*, setToken*/ } from "../app/src/slices/authSlice";

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [remember, setRemember] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [login, { isLoading }] = useLoginMutation();

  const onSignIn = async () => {
    try {
      const u = await login({ email, password }).unwrap();
      dispatch(setUser({ id: u._id, name: u.name, email: u.email }));
      // בעתיד עם JWT: dispatch(setToken(token)); להשתמש ב-remember כדי להחליט persist.
      router.replace("/product"); // שנה ל"/home" אם זה המסך שלך
    } catch (e: any) {
      alert(e?.data?.message || e?.error || "Sign in failed");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffffff" }}>
      <View style={s.page}>
        <Ionicons name="arrow-back" size={22} onPress={() => router.back()} style={s.back} />
        <Logo sizeMultiplier={0.7} textScale={0.15} />
        <Text style={s.title}>Sign In</Text>

        <TextField value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" />
        <TextField value={password} onChangeText={setPassword} placeholder="Password" secure />

        <Button title={isLoading ? "..." : "Sign In"} onPress={onSignIn} />
        {isLoading && <ActivityIndicator style={{ marginTop: 6 }} />}

        <Text style={s.switch}>
          Don’t have an account? <Link href="/sign-up">Sign up</Link>
        </Text>

        <View style={s.remember}>
          <Text style={{ color: "#6B7280" }}>remember me</Text>
          <Checkbox value={remember} onValueChange={setRemember} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, gap: 12, justifyContent: "center" },
  back: { position: "absolute", top: 8, left: 8 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginTop: 6, marginBottom: 8 },
  switch: { textAlign: "center", marginTop: 8, color: "#111827" },
  remember: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 10 }
});
