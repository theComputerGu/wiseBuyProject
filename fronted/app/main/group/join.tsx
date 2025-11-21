// app/main/group/join.tsx

import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { setActiveGroup } from "../../../redux/slices/groupSlice";
import Logo from "../../../components/Logo";
import TextField from "../../../components/TextField";
import Button from "../../../components/Button";
import {useAddGroupToUserMutation} from "../../../redux/svc/usersApi";
//import {useLazyGetGroupByCodeQuery} from "../../../redux/svc/groupsApi";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";
import { setUser } from "../../../redux/slices/userSlice";
import { 
  useAddUserToGroupMutation,
  useLazyGetGroupByCodeQuery
} from "../../../redux/svc/groupsApi";

export default function JoinGroup() {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((s: RootState) => s.user);
  const userId = user.current?._id;

  const [code, setCode] = useState("");

  // שימוש נכון ב־Lazy Query
 // const [fetchGroupByCode] = useLazyGetGroupByCodeQuery();

  const [addUserToGroup] = useAddUserToGroupMutation();
  const [addGroupToUser] = useAddGroupToUserMutation();
  const [fetchGroupByCode] = useLazyGetGroupByCodeQuery();

  const onJoin = async () => {
  if (!code.trim()) return Alert.alert("Missing code");
  if (!userId) return Alert.alert("Error", "User not logged in");

  try {
    // 1. להביא את הקבוצה לפי קוד
    const group = await fetchGroupByCode(code.trim()).unwrap();

    if (!group?._id) {
      return Alert.alert("Error", "Group not found");
    }

    // 2. להוסיף את המשתמש לקבוצה
    const updatedGroup = await addUserToGroup({
      groupId: group._id,
      userId,
    }).unwrap();

    // 3. להוסיף את הקבוצה למשתמש
    await addGroupToUser({
      userId,
      groupId: group._id,
    }).unwrap();

    // 4. לעדכן את ה־Redux
    dispatch(setActiveGroup(updatedGroup));

    Alert.alert("Success", "Joined group!", [
      { text: "OK", onPress: () => router.replace("/main/group") },
    ]);

  } catch (e) {
    console.log("JOIN ERROR:", e);
    Alert.alert("Error", "Could not join group");
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={s.container}>
        <Ionicons
          name="arrow-back"
          size={22}
          onPress={() => router.replace("/main/group")}
          style={s.back}
        />

        <Logo sizeMultiplier={0.6} textScale={0.18} />
        <Text style={s.title}>Join Group</Text>

        <TextField
          placeholder="Group code"
          value={code}
          onChangeText={setCode}
        />

        <Button title="Join Group" onPress={onJoin} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", gap: 12 },
  back: { position: "absolute", top: 10, left: 12 },
  title: { fontSize: 28, fontWeight: "900", textAlign: "center" },
});
