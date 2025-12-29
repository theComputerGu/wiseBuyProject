import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  Alert,
  Pressable,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { setActiveGroup } from "../../../redux/slices/groupSlice";
import TextField from "../../../components/TextField";
import ItimText from "../../../components/Itimtext";
import { useCreateGroupMutation } from "../../../redux/svc/groupsApi";
import { useAddGroupToUserMutation } from "../../../redux/svc/usersApi";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";

const { height: screenHeight } = Dimensions.get("window");
const BRAND = "#197FF4";

export default function CreateGroup() {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((s: RootState) => s.user);
  const userId = user.current?._id;

  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [createGroup] = useCreateGroupMutation();
  const [addGroupToUser] = useAddGroupToUserMutation();

  const onCreateGroup = async () => {
    if (!groupName.trim()) {
      return Alert.alert("Missing name", "Please enter a group name.");
    }

    if (!userId) {
      return Alert.alert("Error", "User not found");
    }

    setIsLoading(true);

    try {
      const group = await createGroup({
        name: groupName.trim(),
        adminId: userId,
      }).unwrap();

      await addGroupToUser({
        userId,
        groupId: group._id,
      }).unwrap();

      dispatch(setActiveGroup(group));

      setIsLoading(false);
      Alert.alert("Success", "Group created!", [
        { text: "OK", onPress: () => router.replace("/main/group") },
      ]);
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert("Error", e?.data?.message || "Failed to create group");
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
            onPress={() => router.replace("/main/group")}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={BRAND} />
          </Pressable>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="account-multiple-plus"
                size={50}
                color={BRAND}
              />
            </View>
            <ItimText size={32} color={BRAND} weight="bold">
              Create Group
            </ItimText>
            <ItimText size={15} color="#71717a" style={{ marginTop: 8, textAlign: "center" }}>
              Start a new group and invite your family or friends
            </ItimText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Group Name Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color={BRAND}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextField
                  placeholder="Enter group name"
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color={BRAND}
              />
              <ItimText size={13} color="#71717a" style={{ flex: 1, marginLeft: 10 }}>
                Choose a memorable name for your group. You can invite members after creating it.
              </ItimText>
            </View>

            {/* Create Button */}
            <Pressable
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={onCreateGroup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="plus-circle"
                    size={20}
                    color="#fff"
                  />
                  <ItimText size={18} color="#fff" weight="bold" style={{ marginLeft: 8 }}>
                    Create Group
                  </ItimText>
                </>
              )}
            </Pressable>
          </View>

          {/* Or Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <ItimText size={14} color="#9ca3af" style={{ marginHorizontal: 16 }}>
              or
            </ItimText>
            <View style={styles.dividerLine} />
          </View>

          {/* Join Group Link */}
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/main/group/join")}
          >
            <MaterialCommunityIcons
              name="account-group-outline"
              size={20}
              color={BRAND}
            />
            <ItimText size={16} color={BRAND} weight="600" style={{ marginLeft: 8 }}>
              Join an existing group
            </ItimText>
          </Pressable>
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
    bottom: 80,
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
  // Header Section
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  // Secondary Button
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND,
    backgroundColor: "#fff",
  },
});
