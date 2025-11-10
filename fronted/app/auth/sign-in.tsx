import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import TextField from "../../components/TextField";
import Button from "../../components/Button";
import Logo from "../../components/Logo";

// ✅ RTK Query + Redux
import { useLoginMutation } from "../../redux/svc/wisebuyApi";
import { useDispatch } from "react-redux";
import { setUser /*, setToken*/ } from "../../redux/slices/authSlice";

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { control, handleSubmit, formState: { isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const [login, { isLoading }] = useLoginMutation();

  // -------------------- Submit --------------------
  const onSubmit = async (data: Form) => {
    try {
      const u = await login({ email, password }).unwrap();
      dispatch(setUser({ id: u._id, name: u.name, email: u.email }));
      // בעתיד עם JWT: dispatch(setToken(token)); להשתמש ב-remember כדי להחליט persist.
      router.replace("/product"); // שנה ל"/home" אם זה המסך שלך
    } catch (e: any) {
      const msg = e?.data?.message || e?.error || "Login failed";
      alert(msg);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffffff" }}>
      <View style={s.page}>
        <Ionicons name="arrow-back" size={22} onPress={() => router.back()} style={s.back} />
        <Logo sizeMultiplier={0.7} textScale={0.15} />
        <Text style={s.title}>Sign In</Text>

        <Controller
          name="email"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <>
              <TextField
                value={value}
                onChangeText={onChange}
                placeholder="Email"
                keyboardType="email-address"
              />
              {error && <Text style={s.err}>{error.message}</Text>}
            </>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <>
              <TextField
                value={value}
                onChangeText={onChange}
                placeholder="Password"
                secure
              />
              {error && <Text style={s.err}>{error.message}</Text>}
            </>
          )}
        />

        <Button
          title={isSubmitting || isLoading ? "..." : "Sign In"}
          onPress={handleSubmit(onSubmit)}
        />
        {(isSubmitting || isLoading) && <ActivityIndicator style={{ marginTop: 8 }} />}

        <Text style={s.switch}>
          Don’t have an account? <Link href="/sign-up">Sign up</Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, gap: 12, justifyContent: "center" },
  back: { position: "absolute", top: 8, left: 8 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginTop: 6, marginBottom: 8 },
  switch: { textAlign: "center", marginTop: 8, color: "#111827" },
  err: { color: "red", fontSize: 12, marginTop: -6, marginBottom: 4 },
});
