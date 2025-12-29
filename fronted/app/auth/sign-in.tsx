import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../components/TextField";
import ItimText from "../../components/Itimtext";
import Logo from "../../assets/logos/logo blue.png";
import { useLoginMutation } from "../../redux/svc/usersApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { setActiveGroup } from "../../redux/slices/groupSlice";
import { useLazyGetGroupByIdQuery } from "../../redux/svc/groupsApi";
import { useLazyGetListByIdQuery } from "../../redux/svc/shoppinglistApi";
import { setActiveList } from "../../redux/slices/shoppinglistSlice";

const { height: screenHeight } = Dimensions.get("window");
const BRAND = "#197FF4";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type Form = z.infer<typeof schema>;

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();
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
        passwordPlain: data.password,
      }).unwrap();

      dispatch(setUser(u));

      if (u.activeGroup) {
        const { data: groupData } = await fetchGroupById(u.activeGroup);

        if (groupData) {
          dispatch(setActiveGroup(groupData));

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
      const msg = "Incorrect email or password";
      alert(msg);
    }
  };

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
              <Image source={Logo} style={styles.logo} />
            </View>
            <ItimText size={32} color={BRAND} weight="bold">
              Welcome Back
            </ItimText>
            <ItimText size={15} color="#71717a" style={{ marginTop: 8 }}>
              Sign in to continue shopping smart
            </ItimText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
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

            {/* Sign In Button */}
            <Pressable
              style={[
                styles.primaryButton,
                (isSubmitting || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <ItimText size={18} color="#fff" weight="bold">
                    Sign In
                  </ItimText>
                  <MaterialCommunityIcons
                    name="login"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </Pressable>
          </View>

          {/* Switch to Sign Up */}
          <View style={styles.switchSection}>
            <ItimText size={15} color="#71717a">
              Don't have an account?{" "}
            </ItimText>
            <Pressable onPress={() => router.replace("/auth/sign-up")}>
              <ItimText size={15} color={BRAND} weight="bold">
                Sign Up
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
    top: screenHeight * 0.4,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(25, 127, 244, 0.05)",
  },
  decorCircle3: {
    position: "absolute",
    bottom: 60,
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
    marginBottom: 24,
  },
  // Logo Section
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  // Form Section
  formSection: {
    width: "100%",
    gap: 16,
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
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  // Switch Section
  switchSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
});
