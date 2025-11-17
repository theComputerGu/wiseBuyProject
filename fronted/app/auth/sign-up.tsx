import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ActivityIndicator, Image, Pressable } from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { useCreateUserMutation, useUploadAvatarMutation } from "../../redux/svc/Wisebuyapi";
import { useDispatch } from "react-redux";
import { setUser /*, setToken*/ } from "../../redux/slices/authSlice";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type Form = z.infer<typeof schema>;

export default function SignUp() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [remember, setRemember] = useState(false);
  const [pickedUri, setPickedUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const [createUser, { isLoading }] = useCreateUserMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();


  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert("Permission to access media library is required");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) {
      setPickedUri(res.assets[0].uri);
    }
  };

  const onSubmit = async (data: Form) => {
  try {
    const u = await createUser({
      name: data.name,
      email: data.email,
      password: data.password,
    }).unwrap();

    let finalUser = u;

    if (pickedUri) {
      const file = {
        uri: pickedUri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any;

      const updated = await uploadAvatar({ id: u._id, file }).unwrap();
      finalUser = updated;
    }

    dispatch(
      setUser({
        _id: finalUser._id,
        name: finalUser.name,
        email: finalUser.email,
        avatarUrl: finalUser.avatarUrl ?? null,
        groups: [],
        createdAt: finalUser.createdAt ?? "",
        updatedAt: finalUser.updatedAt ?? "",
      })
    );

      router.replace("/main/product");

    } catch (e: any) {
      const msg = e?.data?.message || e?.error || "Could not create account";
      alert(msg);
    }
  };

  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={s.page}>
        <Ionicons
          name="arrow-back"
          size={24}
          onPress={() => router.replace('/auth/home')}
          style={s.back}
          color="#197FF4"
        />
        <Logo sizeMultiplier={0.5} textScale={0.2} />
        <Text style={s.title}>Sign Up</Text>

        {/* 🧍 Name */}
        <Controller
          name="name"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <>
              <TextField value={value} onChangeText={onChange} placeholder="Name" />
              {error && <Text style={s.err}>{error.message}</Text>}
            </>
          )}
        />

        {/* 📧 Email */}
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

        {/* 🔒 Password */}
        <Controller
          name="password"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <>
              <TextField value={value} onChangeText={onChange} placeholder="Password" secure />
              {error && <Text style={s.err}>{error.message}</Text>}
            </>
          )}
        />

        {/* 🔒 Confirm */}
        <Controller
          name="confirm"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <>
              <TextField value={value} onChangeText={onChange} placeholder="Confirm Password" secure />
              {error && <Text style={s.err}>{error.message}</Text>}
            </>
          )}
        />

        {/* 🖼️ Avatar Picker */}
        <View style={{ marginTop: 8, gap: 8 }}>
          {pickedUri ? (
            <View style={{ alignItems: "center", gap: 8 }}>
              <Image source={{ uri: pickedUri }} style={s.preview} />
              <Pressable onPress={pickImage} style={s.pickBtn}>
                <Text style={s.pickBtnText}>Choose another photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={pickImage} style={s.pickBtn}>
              <Text style={s.pickBtnText}>Choose profile photo (optional)</Text>
            </Pressable>
          )}
        </View>

        {/* 🚀 Submit */}
        <Button
          title={isSubmitting || isLoading || isUploading ? "..." : "Sign Up"}
          onPress={handleSubmit(onSubmit)}
        />
        {(isSubmitting || isLoading || isUploading) && (
          <ActivityIndicator style={{ marginTop: 8 }} color="#197FF4" />
        )}

        {/* 🔁 Switch to Sign In */}
        <Text style={s.switch}>
          Already have an account? <Link href="/auth/sign-in">Sign In</Link>
        </Text>

        {/* 🧠 Remember me */}
        <View style={s.remember}>
          <Text style={{ color: "#6B7280" }}>Remember me</Text>
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
  err: { color: "red", fontSize: 12, marginTop: -6, marginBottom: 4 },
  remember: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  preview: { width: 84, height: 84, borderRadius: 42, backgroundColor: "#eee" },
  pickBtn: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#197FF4",
    backgroundColor: "#EAF3FF",
  },
  pickBtnText: { color: "#197FF4", fontWeight: "600" },
});
