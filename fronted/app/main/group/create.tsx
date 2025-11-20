import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import Logo from "../../../components/Logo";
import TextField from "../../../components/TextField";
import Button from "../../../components/Button";

import { useCreateGroupMutation } from "../../../redux/svc/groupsApi";
import { useAddGroupToUserMutation } from "../../../redux/svc/usersApi";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";
import { setActiveGroup } from "../../../redux/slices/groupSlice";

export default function CreateGroup() {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((s: RootState) => s.user);
  const userId = user.current?._id;

  const [groupName, setGroupName] = useState("");

  const [createGroup] = useCreateGroupMutation();
  const [addGroupToUser] = useAddGroupToUserMutation();

  const onCreateGroup = async () => {
    if (!groupName.trim()) 
      return Alert.alert("Missing name", "Please enter a group name.");

    if (!userId) 
      return Alert.alert("Error", "User not found");

    try {
      // 1️⃣ יצירת קבוצה
      const group = await createGroup({
        name: groupName.trim(),
        adminId: userId,
      }).unwrap();

      // 2️⃣ הוספת המשתמש לקבוצה
      await addGroupToUser({ userId, groupId: group._id }).unwrap();

      // 3️⃣ הפיכת הקבוצה לאקטיבית
      dispatch(setActiveGroup(group));

      Alert.alert("Success", "Group created!", [
        { text: "OK", onPress: () => router.replace("/main/group") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message || "Failed to create group");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={s.page}>
        <Ionicons
          name="arrow-back"
          size={22}
          onPress={() => router.replace("/main/group")}
          style={s.back}
        />

        <Logo sizeMultiplier={0.55} textScale={0.18} />
        <Text style={s.title}>Create Group</Text>

        <Text style={s.label}>Group Name</Text>

        <TextField
          placeholder="Enter group name"
          value={groupName}
          onChangeText={setGroupName}
        />

        <View style={{ gap: 10, marginTop: 6 }}>
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
