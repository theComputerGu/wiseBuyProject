import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { useLoginMutation } from "../../redux/svc/usersApi";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { setActiveGroup, } from "../../redux/slices/groupSlice";
import { useGetGroupByIdQuery, useLazyGetGroupByIdQuery } from "../../redux/svc/groupsApi";
import { useGetListByIdQuery, useLazyGetListByIdQuery } from "../../redux/svc/shoppinglistApi";
import { setActiveList } from "../../redux/slices/shoppinglistSlice";


const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});


type Form = z.infer<typeof schema>;

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s: any) => s?.user);
  const ShoppingList = useSelector((s: any) => s?.ShoppingList);
  const group = useSelector((s: any) => s?.group);
  const [fetchGroupById] = useLazyGetGroupByIdQuery();
  const [fetchListById] = useLazyGetListByIdQuery();



  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (data: Form) => {
    try {
      const u = await login({
        email: data.email,
        passwordPlain: data.password
      }).unwrap();

      dispatch(setUser(u));

      // --- LOAD ACTIVE GROUP ---
      if (u.activeGroup) {
        const { data: groupData } = await fetchGroupById(u.activeGroup);

        if (groupData) {
          dispatch(setActiveGroup(groupData));

          // --- LOAD ACTIVE SHOPPING LIST ---
          const { data: listData } = await fetchListById(
            groupData.activeshoppinglist
          );

          if (listData) {
            dispatch(setActiveList(listData));
          }
        }
      }

      router.replace("/main/product");

    } catch (err: any) {
      const msg =
        err?.data?.message?.[0] ||
        err?.data?.message ||
        "Incorrect email or password";

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
          onPress={() => router.replace('/auth/home')}
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
