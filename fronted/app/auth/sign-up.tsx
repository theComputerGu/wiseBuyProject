import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import TextField from "../../components/TextField";
import ItimText from "../../components/Itimtext";
import LogoImage from "../../assets/logos/logo blue.png";
import {
  useCreateUserMutation,
  useUploadAvatarMutation,
} from "../../redux/svc/usersApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { setActiveGroup } from "../../redux/slices/groupSlice";
import { useLazyGetGroupByIdQuery } from "../../redux/svc/groupsApi";
import { useLazyGetListByIdQuery } from "../../redux/svc/shoppinglistApi";
import { setActiveList } from "../../redux/slices/shoppinglistSlice";

const { height: screenHeight } = Dimensions.get("window");
const BRAND = "#197FF4";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type Form = z.infer<typeof schema>;

export default function SignUp() {
  const router = useRouter();
  const dispatch = useDispatch();
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
  const [fetchGroup] = useLazyGetGroupByIdQuery();
  const [fetchList] = useLazyGetListByIdQuery();

  const pickImage = async () => {
    const { granted } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        passwordPlain: data.password,
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
          groups: finalUser.groups,
          activeGroup: finalUser.activeGroup || null,
          createdAt: finalUser.createdAt,
          updatedAt: finalUser.updatedAt,
        })
      );

      if (finalUser.activeGroup) {
        const { data: groupData } = await fetchGroup(finalUser.activeGroup);

        if (groupData) {
          dispatch(setActiveGroup(groupData));

          const { data: listData } = await fetchList(
            groupData.activeshoppinglist
          );

          if (listData) {
            dispatch(setActiveList(listData));
          }
        }
      }

      router.replace("/main/product");
    } catch (e: any) {
      const msg = e?.data?.message || "Could not create account";
      alert(msg);
    }
  };

  const isBusy = isSubmitting || isLoading || isUploading;

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative background elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Pressable
            style={styles.backBtn}
            onPress={() => router.replace("/auth/home")}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={BRAND} />
          </Pressable>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image source={LogoImage} style={styles.logo} />
            </View>
            <ItimText size={28} color={BRAND} weight="bold">
              Create Account
            </ItimText>
            <ItimText size={14} color="#71717a" style={{ marginTop: 6 }}>
              Join WiseBuy and start saving today
            </ItimText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Avatar Picker */}
            <View style={styles.avatarSection}>
              <Pressable style={styles.avatarPicker} onPress={pickImage}>
                {pickedUri ? (
                  <Image source={{ uri: pickedUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialCommunityIcons
                      name="camera-plus-outline"
                      size={28}
                      color={BRAND}
                    />
                  </View>
                )}
                <View style={styles.avatarBadge}>
                  <MaterialCommunityIcons name="pencil" size={12} color="#fff" />
                </View>
              </Pressable>
              <ItimText size={13} color="#71717a" style={{ marginTop: 8 }}>
                Add photo (optional)
              </ItimText>
            </View>

            {/* Name Field */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={BRAND}
                />
              </View>
              <Controller
                name="name"
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <View style={styles.inputContainer}>
                    <TextField
                      value={value}
                      onChangeText={onChange}
                      placeholder="Full Name"
                    />
                    {error && (
                      <ItimText size={12} color="#ef4444" style={styles.error}>
                        {error.message}
                      </ItimText>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Email Field */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={BRAND}
                />
              </View>
              <Controller
                name="email"
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <View style={styles.inputContainer}>
                    <TextField
                      value={value}
                      onChangeText={onChange}
                      placeholder="Email"
                      keyboardType="email-address"
                    />
                    {error && (
                      <ItimText size={12} color="#ef4444" style={styles.error}>
                        {error.message}
                      </ItimText>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={BRAND}
                />
              </View>
              <Controller
                name="password"
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <View style={styles.inputContainer}>
                    <TextField
                      value={value}
                      onChangeText={onChange}
                      placeholder="Password"
                      secure
                    />
                    {error && (
                      <ItimText size={12} color="#ef4444" style={styles.error}>
                        {error.message}
                      </ItimText>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialCommunityIcons
                  name="lock-check-outline"
                  size={20}
                  color={BRAND}
                />
              </View>
              <Controller
                name="confirm"
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <View style={styles.inputContainer}>
                    <TextField
                      value={value}
                      onChangeText={onChange}
                      placeholder="Confirm Password"
                      secure
                    />
                    {error && (
                      <ItimText size={12} color="#ef4444" style={styles.error}>
                        {error.message}
                      </ItimText>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Sign Up Button */}
            <Pressable
              style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isBusy}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <ItimText size={18} color="#fff" weight="bold">
                    Create Account
                  </ItimText>
                  <MaterialCommunityIcons
                    name="account-plus"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </Pressable>
          </View>

          {/* Switch to Sign In */}
          <View style={styles.switchSection}>
            <ItimText size={15} color="#71717a">
              Already have an account?{" "}
            </ItimText>
            <Pressable onPress={() => router.replace("/auth/sign-in")}>
              <ItimText size={15} color={BRAND} weight="bold">
                Sign In
              </ItimText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  // Decorative circles
  decorCircle1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(25, 127, 244, 0.08)",
  },
  decorCircle2: {
    position: "absolute",
    top: screenHeight * 0.5,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(25, 127, 244, 0.05)",
  },
  decorCircle3: {
    position: "absolute",
    bottom: 40,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(25, 127, 244, 0.06)",
  },
  // Back Button
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  // Logo Section
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarPicker: {
    position: "relative",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8fafc",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  // Form Section
  formSection: {
    width: "100%",
    gap: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  inputIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 4,
  },
  inputContainer: {
    flex: 1,
  },
  error: {
    marginTop: 4,
    marginLeft: 4,
  },
  // Primary Button
  primaryButton: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: BRAND,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  // Switch Section
  switchSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
});
