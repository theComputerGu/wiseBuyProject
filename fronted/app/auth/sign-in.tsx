import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 🧩 Components
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import Logo from "../../components/Logo";

// 🧠 Redux + RTK Query
import { useLoginMutation } from "../../redux/svc/wisebuyApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";

// ✅ Zod validation schema
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// ✅ Type derived automatically from schema
type Form = z.infer<typeof schema>;

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();

  // ✅ React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // ✅ RTK Query login mutation
  const [login, { isLoading }] = useLoginMutation();

  // -------------------- Submit --------------------
  const onSubmit = async (data: Form) => {
    try {
      // ✅ use destructured data.email, data.password
      const u = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      // ✅ Save user to Redux
      dispatch(setUser({ id: u._id, name: u.name, email: u.email,avatarUrl: u.avatarUrl ?? null }));

      // ✅ Navigate and clear stack
      router.replace("/main/product");
    } catch (e: any) {
      const msg = e?.data?.message || e?.error || "Login failed";
      alert(msg);
    }
  };

  // -------------------- Render --------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={s.page}>
        {/* 🔙 Back Button */}
        <Ionicons
          name="arrow-back"
          size={24}
          onPress={() => router.back()}
          style={s.back}
          color="#197FF4"
        />

        {/* 🧠 Logo & Title */}
        <Logo sizeMultiplier={0.7} textScale={0.15} />
        <Text style={s.title}>Sign In</Text>

        {/* 📧 Email Field */}
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

        {/* 🔒 Password Field */}
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

        {/* 🚀 Submit Button */}
        <Button
          title={isSubmitting || isLoading ? "..." : "Sign In"}
          onPress={handleSubmit(onSubmit)}
        />
        {(isSubmitting || isLoading) && <ActivityIndicator style={{ marginTop: 8 }} color="#197FF4" />}

        {/* 🔁 Switch to Sign Up */}
        <Text style={s.switch}>
          Don’t have an account? <Link href="/auth/sign-up">Sign up</Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    padding: 20,
    gap: 12,
    justifyContent: "center",
  },
  back: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 8,
    color: "#111",
  },
  switch: {
    textAlign: "center",
    marginTop: 8,
    color: "#111827",
  },
  err: {
    color: "red",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 4,
  },
});
