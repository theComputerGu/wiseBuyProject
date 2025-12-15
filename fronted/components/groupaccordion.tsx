import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/state/store";

import {
  useGetUserByIdQuery,
  useGetUserGroupsQuery,      // ✅ חדש – לרענון קבוצות של המשתמש
} from "../redux/svc/usersApi";

import {
  useRemoveUserFromGroupMutation,
  useDeleteGroupMutation,
  useGetGroupUsersQuery,
} from "../redux/svc/groupsApi";

import { setUser } from "../redux/slices/userSlice";
import { clearActiveGroup } from "../redux/slices/groupSlice";

export default function GroupAccordion({ group }: any) {
  const dispatch = useDispatch();

  // 🟦 משתמש מחובר
  const user = useSelector((s: RootState) => s.user);
  const userId = user.current?._id;

  if (!userId) return null;

  // 🟦 משתמש מעודכן מהשרת
  // const { refetch: refetchUser } = useGetUserByIdQuery(userId, {
  //   skip: !userId,
  // });

  // 🟦 קבוצות של המשתמש – בשביל רענון UI
  // const { refetch: refetchUserGroups } = useGetUserGroupsQuery(userId, {
  //   skip: !userId,
  // });

  // 🟦 בדיקה אם אדמין
  const isAdmin =
    typeof group.admin === "string"
      ? group.admin === userId
      : group.admin?._id === userId;

  // 🟦 Hooks לשרת
  const [removeUserFromGroup] = useRemoveUserFromGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  // 🟦 מביאים משתמשים בקבוצה
  const { data: members = [] } = useGetGroupUsersQuery(group._id);

  // ---------------------------------------------------------
  // יציאה מקבוצה
  // ---------------------------------------------------------
  const handleLeave = () => {
    Alert.alert("Leave group", `Are you sure you want to leave "${group.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await removeUserFromGroup({
              groupId: group._id,
              userId: userId!,
            }).unwrap();

            // const freshUser = await refetchUser().unwrap();

            // dispatch(setUser({
            //   ...freshUser,
            //   avatarUrl: freshUser.avatarUrl ?? null,
            //   groups: freshUser.groups ?? [],
            // }));

            dispatch(clearActiveGroup());      // ✅ ניקוי קבוצה פעילה
            // await refetchUserGroups();        // ✅ רענון קבוצות המשתמש

            Alert.alert("Success", "You left the group");
          } catch (err) {
            console.log("LEAVE ERROR:", err);
            Alert.alert("Error", "Could not leave group");
          }
        },
      },
    ]);
  };

  // ---------------------------------------------------------
  // מחיקת קבוצה (אם אדמין)
  // ---------------------------------------------------------
  const handleDelete = () => {
    Alert.alert("Delete group", `Delete "${group.name}" permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteGroup({
              id: group._id,
              requesterId: userId!,
            }).unwrap();

            // const freshUser = await refetchUser().unwrap();

            // dispatch(setUser({
            //   ...freshUser,
            //   avatarUrl: freshUser.avatarUrl ?? null,
            //   groups: freshUser.groups ?? [],
            // }));

            dispatch(clearActiveGroup());      // ✅ ניקוי קבוצת default
            // await refetchUserGroups();        // ✅ רענון קבוצות המשתמש

            Alert.alert("Deleted", "Group removed successfully");
          } catch (err) {
            console.log("DELETE ERROR:", err);
            Alert.alert("Error", "Could not delete group");
          }
        },
      },
    ]);
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <View style={styles.box}>
      <Text style={styles.label}>Group Code: #{group.groupcode}</Text>

      <Text style={styles.label}>Members:</Text>

      {members.map((u: any) => (
        <View key={u._id} style={styles.memberRow}>
          <Ionicons name="person-circle-outline" size={20} />
          <Text style={styles.member}>
            {u.name}
            {u._id === group.admin ? " (Admin)" : ""}
            {"  "}
            <Text style={{ color: "#888" }}>@{u.email}</Text>
          </Text>
        </View>
      ))}

      {!isAdmin && (
        <Pressable onPress={handleLeave}>
          <Text style={styles.leave}>Leave Group</Text>
        </Pressable>
      )}

      {/* לא לאפשר למחוק קבוצת ברירת מחדל */}
      {isAdmin && !group.name.endsWith("'s Group") && (
        <Pressable onPress={handleDelete}>
          <Text style={styles.delete}>Delete Group</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 15,
  },
  memberRow: { flexDirection: "row", alignItems: "center", marginVertical: 2 },
  member: { marginLeft: 6, fontSize: 14, fontWeight: "600" },
  leave: { marginTop: 12, color: "red", fontWeight: "700" },
  delete: { marginTop: 12, color: "red", fontWeight: "900", fontSize: 15 },
});
